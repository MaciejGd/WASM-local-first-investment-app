import { RequestGET, RequestPOST } from "../Requests.js";


class Operation {
    constructor(deletion, addition) {
        this.is_deletion = deletion;
        this.is_addition = addition;
    }
}

// incoming object: id, table name, addition + payload
// pushing object: id, table name, addition + payload (we would sync based on that so that should be fine)


// API schema: PUT JSON file to the output object, id, table_name, date, addition, payload if  
// API schema:
class Synchronizer {
    static PUSH_ENDPOINT = "http://127.0.0.1:5000/sync/push";
    static PURGE_ENDPOINT = "http://127.0.0.1:5000/sync/purge";
    constructor() {
        // we have two basic actions to perform
        this.event_queue = []; // store all events to be propagated to the remote server
        this.incoming_queue = [];
        
    }

    addAdditionToEventQueue(id, table_name, payload) {
        var add_object =  ({
            id: id,
            table_name: table_name,
            payload: payload,
        });
        this._addEventToQueue(add_object);
    }

    addRemovalToEventQueue(id, table_name) {
        var rem_object = {
            id: id,
            table_name: table_name,
            payload: null,
        };
        this._addEventToQueue(rem_object);
    }

    /**
     * Append metadata to the object and push to the queue
     * @param {Object} object object to be pushed to the queue
     */
    _addEventToQueue(object) {
        object.date = new Date();
        this.event_queue.push(object);
    }

    async pushToRemote() {
        // we should go through changes history and possibly remove / add new records
        // we are sure that id of our records would be different
        // first keep a state
        // we should open an endpoint 
        // we should somehow place something about pushing the changes
        var ev = this.event_queue[0];
        var response = null;
        try {
            response = await RequestPOST(Synchronizer.PUSH_ENDPOINT, ev);
        }
        catch (error) {
            console.error(error);
            return;
        }
        // here we should check for the response code        
        this.event_queue.shift(); // if succeeded do not forget to pop from the queue
        console.log(response);
    }

    pollData() {
        RequestGET();
    }

    async purgeTable(table_name) {
        try {
            response = await RequestPOST(Synchronizer.PURGE_ENDPOINT, {"table_name" : table_name});
        }
        catch (error) {
            console.log(error);
            return;
        }
        console.log(response);
    }
};

export var sync = new Synchronizer();