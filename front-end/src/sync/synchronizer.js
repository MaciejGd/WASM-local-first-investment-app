import { DBEncryptor } from "../db/db_encryptor.js";
import { RequestGET, RequestPOST } from "../Requests.js";
import { getDBInstance, getTablesHashes, clearTable } from "../db/db.js";
import { SyncDBUpdater } from "./syncDBUpdater.js";

// From here we should somehow put events into a Dexie db so that events are being preserved between sessions and resistant to some
// unexpected power outages and smth like this.
// our issue is that actually the event queue should use some kind of dexie.db interface, and our og interface has  been craeted in another context
// which is not accessible by our worker.

/**
 * Event queue that will be stored in the local IndexedDB instance.
 */
class PersistentEventQueue {
  constructor(table_handle) {
    this.table = table_handle;
  }

  /**
   * Is queue empty
   * @returns true if queue is empty, false otherwise
   */
  async empty() {
    return (await this.table.count()) == 0;
  }

  /**
   * Get oldest item from the queue
   * @returns oldest item from the queue
   */
  async front() {
    return await this.table.orderBy("id").first();
  }

  /**
   * Remove oldest item from the queue and return it
   * @returns deleted front item from the table
   */
  async pop() {
    const item = await this.table.orderBy("id").first();

    if (!item) {
      // no items in the table
      return null;
    }
    // delete item by its id
    await this.table.delete(item.id);
    return item;
  }

  /**
   * Get length of the persistent queue
   * @returns length of the persistent queue
   */
  async length() {
    return await this.table.count();
  }

  /**
   * Add new event's data to the queue
   * @param {object} data data to be added to queue
   */
  async push(data) {
    await this.table.add(data);
  }
}

export class DBSynchronizer {
  static PUSH_ENDPOINT = "http://127.0.0.1:5000/sync/push_event";
  static PURGE_ENDPOINT = "http://127.0.0.1:5000/sync/purge";
  static PULL_EVENTS_IDS = "http://127.0.0.1:5000/sync/pull_events_ids/";
  static PULL_EVENTS = "http://127.0.0.1:5000/sync/pull_events/";
  static COMPARE_HASHES = "http://127.0.0.1:5000/sync/hash_compare";
  constructor() {
    // we have two basic actions to perform
    this.db_handle = getDBInstance(); // create db handle
    this.metadata = this.db_handle.metadata;
    // store all events to be propagated to the remote server
    this.event_queue = new PersistentEventQueue(this.db_handle.out_events);
    this.db_updater = new SyncDBUpdater(this.db_handle);
    this.incoming_queue = [];
    this.outgoing_events_pending = false;
  }

  async addAdditionToEventQueue(ulid, table_name, hash, payload) {
    var add_object = {
      ulid: ulid,
      table_name: table_name,
      type: "add",
      hash: hash,
      payload: payload,
    };
    await this._addEventToQueue(add_object);
  }

  async addRemovalToEventQueue(ulid, table_name) {
    var rem_object = {
      ulid: ulid,
      table_name: table_name,
      type: "remove",
      hash: null, // we should not need the hash for removing, it can be retrieved from the DB
      payload: null,
    };
    await this._addEventToQueue(rem_object);
  }

  /**
   * Append metadata to the object and push to the queue
   * @param {Object} object object to be pushed to the queue
   */
  async _addEventToQueue(object) {
    object.timestamp = new Date();
    object.payload = await DBEncryptor.encrypt(object.payload); // encrypt payload before sending to server
    await this.event_queue.push(object);
  }

  /**
   * Try pushing all events from the queue to the sync server
   * TODO - add logic so that it is not possible to send request while other is being proceedz
   */
  async pushToRemote() {
    if (this.event_queue === undefined || (await this.event_queue.empty())) {
      return;
    }

    console.log("Pushing events out to remotes");
    const push_event = async () => {
      console.log("In events push");
      var ev = await this.event_queue.front();
      var response = null;
      try {
        response = await RequestPOST(DBSynchronizer.PUSH_ENDPOINT, ev);
      } catch (error) {
        console.error(error);
        return false;
      }
      // here we should check for the response code
      await this.event_queue.pop(); // if succeeded do not forget to pop from the queue
      console.log(response);
      this.db_updater.updateLastEventId(response.event_id);

      return true;
    };
    while ((await this.event_queue.empty()) === false) {
      let ret = await push_event();
      if (ret == false) break;
    }

    this.outgoing_events_pending = false;
  }

  /**
   * Pull data from remote if last event id stored in local db does not match last remote
   * @returns Null
   */
  async pullFromRemote() {
    // at first poll the list of events to be updated
    // check how many events are actyually pending in the list
    try {
      var lastId = await this.db_updater.getLastEventId();
      var ids = await RequestGET(
        DBSynchronizer.PULL_EVENTS_IDS + lastId.toString(),
      );
      console.log(ids);
      // here we should probably validate the data
      if (ids.length == 0) {
        console.log("No remote changes");
        return true;
      }
      if (ids.length > 100) {
        // We do not want to update in here any more. We would rather just pull the whole db from remote if amount of changes is great
        console.log("Huge amount of changes, skip udpate");
        return true;
      }
      // if checks passed, fetch changes from remote
      var events = await RequestGET(DBSynchronizer.PULL_EVENTS + lastId);
      await this.updatePendingEvents(events);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Add events from remote server to local IndexedDb instance.
   * @param {Array} events array of pending events updated to remote server, to be added to local db
   */
  async updatePendingEvents(events) {
    console.log("In updating the events!");
    var biggest_id = -1;
    try {
      for (let i = 0; i < events.length; i++) {
        var event = events[i];
        biggest_id = Math.max(biggest_id, event.id);
        if (event.type == "remove") {
          await this.db_updater.removeRecord(event.ulid, event.table_name);
        } else if (event.type == "add") {
          var payload = await DBEncryptor.decrypt(event.payload);
          await this.db_updater.addRecord(
            event.ulid,
            event.table_name,
            event.hash,
            payload,
          );
        } else {
          console.error(`Not known event's type received: ${event.type}`);
        }
      }

      if (biggest_id !== -1) {
        console.log(`Updating last received id with: ${biggest_id}`);
        await this.db_updater.updateLastEventId(biggest_id);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Call external server for comparing db hashes. If hashes are not equal, purge actual table and
   * fill with content from remote server
   * @returns True on success, False otherwise
   */
  async compareHashes() {
    var ev = await getTablesHashes();
    var response = null;
    try {
      // post a request but response can either return empty object or db to be updated
      response = await RequestPOST(DBSynchronizer.COMPARE_HASHES, ev);
    } catch (error) {
      console.error(error);
      return false;
    }
    // here we should check for the response code
    var hashes = await getTablesHashes();
    // add all records one by one for now
    for (let [table_name, value] of Object.entries(response)) {
      // if hashes not equal, reset hash for current table as we would recreate it
      if (value.equal == true) {
        continue;
      }

      await clearTable(table_name); // reset hash of particular table to zeros
      for (let el of value.records) {
        var payload = await DBEncryptor.decrypt(el.payload);
        await this.db_updater.addRecord(
          el.ulid,
          table_name,
          el.hash,
          payload,
        );
      }
    }

    return true;
  }

  async pollData() {
    if (this.outgoing_events_pending === true) {
      return;
    }
    console.log("Polling events from remote!");

    this.outgoing_events_pending = true;
    // first pull data from remote and sync
    await this.pullFromRemote();
    // then push your changes to remote
    await this.pushToRemote();
    await this.compareHashes();
    this.outgoing_events_pending = false;
  }

  /**
   * Testing function. Used for totally purging db
   * @param {*} table_name name of the table to be purged
   * @returns null
   */
  async purgeTable(table_name) {
    var response = null;
    try {
      response = await RequestPOST(DBSynchronizer.PURGE_ENDPOINT, {
        table_name: table_name,
      });
    } catch (error) {
      console.log(error);
      return;
    }
    console.log(response);
  }

  /**
   * Save last event's id in the DB
   * @param {int} id event id to be set in db
   */
  async set_last_event_timestamp(id) {
    await this.metadata.put({
      key: "lastEvent",
      value: id,
    });
  }
}

export var sync = new DBSynchronizer();
