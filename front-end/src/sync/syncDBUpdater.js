import { putDataToDb } from "../db/db";

/**
 * Minimal IndexedDb updater for Synchronizer Worker
 */
export class SyncDBUpdater {
    constructor(db_handle) {
        this.db_handle = db_handle;
    }

    /**
     * Add new record to IndexedDb
     * @param {string} ulid unique identifier of the record
     * @param {string} table_name name of the table to be updated
     * @param {string} payload data to be added
     */
    async addRecord(ulid, table_name, payload) {
        try {
            var table_handle = this.db_handle.table(table_name);
            // insert ulid inside payload
            payload.ulid = ulid;
            // await table_handle.put(payload);
            await putDataToDb(this.db_handle, table_name, payload);
        }
        catch (error) {
            console.log(error);
        }
    }

    /**
     * Remove record from dbs table where ulid matches argument provided
     * @param {string} ulid unique identifier of the record
     * @param {string} table_name name of the table to be modified
     */
    async removeRecord(ulid, table_name) {
        try {
            var table_handle = this.db_handle.table(table_name);
            await table_handle.where("ulid").equals(ulid).delete();
        }
        catch (error) {
            console.log(error);
        }
    }

    async updateLastEventId(id) {
        await this.db_handle.metadata.put({
            key: "lastEvent",
            value: id,
        });
    }

    async getLastEventId() {
        var record = await this.db_handle.metadata.get("lastEvent");
        return (record) ? record.value : 0;
    }
};