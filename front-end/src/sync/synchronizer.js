import { DBEncryptor } from "../db/db_encryptor.js";
import { RequestGET, RequestPOST } from "../Requests.js";
import { getDBInstance } from "../db/db.js";

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
        return await this.table.count() == 0;
    }

    /**
     * Get oldest item from the queue
     * @returns oldest item from the queue
     */
    async front() {
        return await this.table.orderBy('id').first();
    }

    /**
     * Remove oldest item from the queue and return it
     * @returns deleted front item from the table
     */
    async pop() {
        const item = await this.table.orderBy('id').first();

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
};



export class DBSynchronizer {
    static PUSH_ENDPOINT = "http://127.0.0.1:5000/sync/push_event";
    static PURGE_ENDPOINT = "http://127.0.0.1:5000/sync/purge";
    constructor() {
        // we have two basic actions to perform
        this.db_handle = getDBInstance(); // create db handle
        // store all events to be propagated to the remote server
        this.event_queue = new PersistentEventQueue(this.db_handle.out_events); 
        this.incoming_queue = [];
        this.outgoing_events_pending = false;

    }

    async addAdditionToEventQueue(ulid, table_name, payload) {
        var add_object =  ({
            ulid: ulid,
            table_name: table_name,
            type: "add",
            payload: payload,
        });
        await this._addEventToQueue(add_object);
    }

    async addRemovalToEventQueue(ulid, table_name) {
        var rem_object = {
            ulid: ulid,
            table_name: table_name,
            type: "remove",
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
        if (this.event_queue === undefined || await this.event_queue.empty()) {
            return;
        }
        if (this.outgoing_events_pending === true) {
            // events already processed
            return;
        }


        this.outgoing_events_pending = true;

        const push_event = async () => {
            var ev = await this.event_queue.front();
            var response = null;
            try {
                response = await RequestPOST(DBSynchronizer.PUSH_ENDPOINT, ev);
            }
            catch (error) {
                console.error(error);
                return false;
            }
            // here we should check for the response code
            await this.event_queue.pop(); // if succeeded do not forget to pop from the queue
            console.log(response);

            return true;
        };
        while ((await this.event_queue.empty()) === false) {
            let ret = await push_event();
            if (ret == false) break;
        }

        this.outgoing_events_pending = false;
    }

    pollData() {
        RequestGET();
        // TODO remember
    }

    /**
     * Testing function. Used for totally purging db
     * @param {*} table_name name of the table to be purged
     * @returns null
     */
    async purgeTable(table_name) {
        var response = null;
        try {
            response = await RequestPOST(DBSynchronizer.PURGE_ENDPOINT, {"table_name" : table_name});
        }
        catch (error) {
            console.log(error);
            return;
        }
        console.log(response);
    }
};

export var sync = new DBSynchronizer();