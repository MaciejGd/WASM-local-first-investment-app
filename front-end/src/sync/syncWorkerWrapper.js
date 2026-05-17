
/**
 * Wrapper used for communication from main thread with Sync Worker
 */
export class SyncWorkerWrapper {
    constructor() {
        // initialize web worker for sync operations
        this.worker = this.initWorker();
    }

    /**
     * Initialize sync worker.
     * @returns initialized worker
     */
    initWorker() {
        const worker = new Worker(
            new URL("./syncWorker.js", import.meta.url),
            {type:'module'}
        );

        return worker;
    }

    /**
     * Generate crypto key for sync worker, based on provided password and salt.
     * @param {string} passwd password to be used for generating encryption key
     * @param {ArrayBuffer} salt salt used for generating encryption key
     */
    async InitCrypto(passwd, salt) {
        this.worker.postMessage({
            type: "crypto_init",
            passwd: passwd,
            salt: salt,
        });
    }

    /**
     * Add event with new data addition to event's queue
     * @param {string} ulid unique identifier of added record
     * @param {string} table_name name of the table to be modified
     * @param {object} payload data to be added to db
     */
    async AddAdditionEvent(ulid, table_name, payload) {
        this.worker.postMessage({
            type: "add",
            ulid: ulid,
            table_name: table_name,
            payload: payload,
        });
    }

    /**
     * Add event for data removal to event's queue
     * @param {string} ulid unique identifier of removed record
     * @param {string} table_name name of the table to be modified
     */
    async AddRemovalEvent(ulid, table_name) {
        this.worker.postMessage({
            type: "del",
            ulid: ulid,
            table_name: table_name,
        });
    }
};

// global sync worker object
export const sync_worker = new SyncWorkerWrapper();