import { DBEncryptor } from "../db/db_encryptor.js";
import { RequestGET, RequestPOST } from "../Requests.js";

// API schema: PUT JSON file to the output object, id, table_name, date, addition, payload if  
// API schema:
export class DBSynchronizer {
    static PUSH_ENDPOINT = "http://127.0.0.1:5000/sync/push_event";
    static PURGE_ENDPOINT = "http://127.0.0.1:5000/sync/purge";
    constructor() {
        // we have two basic actions to perform
        this.event_queue = []; // store all events to be propagated to the remote server
        this.incoming_queue = [];
        
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
        this.event_queue.push(object);
    }


    /**
     * Try pushing all events from the queue to the sync server
     */
    async pushToRemote() {
        if (this.event_queue === undefined || this.event_queue.length == 0) {
            return;
        }

        const push_event = async () => {
            var ev = this.event_queue[0];
            var response = null;
            try {
                response = await RequestPOST(DBSynchronizer.PUSH_ENDPOINT, ev);
            }
            catch (error) {
                console.error(error);
                return false;
            }
            // here we should check for the response code        
            this.event_queue.shift(); // if succeeded do not forget to pop from the queue
            console.log(response);            

            return true;
        };

        while (this.event_queue.length != 0) {            
            let ret = await push_event();
            if (ret == false) break;
        }
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