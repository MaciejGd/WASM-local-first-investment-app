import hash from "object-hash";
import { sync_worker } from "../sync/syncWorkerWrapper";
import { getDBInstance } from "./db";

/**
 * Singleton handler for DB interacations with tables holding user's data.
 */
export class IndexedDbHandler {
    static instance;
    constructor() {
        if (IndexedDbHandler.instance) {
            return IndexedDbHandler.instance; // if already initialized
        }
        this.db = getDBInstance();
        // assign name to each table object
        this.initializeTableNames();

        this.version_id = 0;
        IndexedDbHandler.instance = this;
    }

    initializeTableNames() {
        this.table_to_name = new Map();
        this.table_to_name.set(this.db.wallet_assets, "wallet_assets");
        this.table_to_name.set(this.db.sim_history, "sim_history");
    }

    /**
     * Add simulation history if it does not already exists in db
     * @param {Object} payload object holding simulation's data
     */
    async addSimsHistory(payload) {
        try {
            // add hash to payload
            var object_hash = this.hashSimsHistory(payload);
            payload.hash = object_hash;
            console.log(payload.hash);
            // check if hash already in db
            var sims_stored = await this.db.sim_history.toArray();
            for (let i = 0; i < sims_stored.length; i++) {
                if (sims_stored[i].hash === payload.hash) {
                    return false;
                }
            }
            await this._addRecord(this.db.sim_history, payload);          
        } 
        catch (error) {
            console.error(error);
            return false;
        }
        return true;

    }

    /**
     * Produce hash of the simulation results record for faster comparisons
     * @param {*} payload object to be hashed
     * @returns hash of the input object
     */
    hashSimsHistory(payload) {
        const new_obj = {
            "assets" : payload.assets,
            "date" : payload.date,
            "results" : payload.results,
            "sims" : payload.sims,
            "timepoints" : payload. timepoints,
        }
        return hash(new_obj);
    }

    /**
     * Add wallet asset to the wallet table in db
     * @param {*} ticker ticker to be added to table
     * @param {*} quantity quantity of the stock to be added to the table
     * @param {*} price prcie of the stock to be added
     * @returns id of the appended asset
     */
    async addWalletAsset(payload) {
        try {
            var ret = await this._addRecord(this.db.wallet_assets, payload);
            return ret;
        }
        catch (error) {
            console.error(error);
        }
    }

    /**
     * Should be used instead of plain add method of Dexie.js. This function
     * appends metadata to the object that would be later used for encryption
     * it updates the event queue and tries pushing changes to remote sync server
     * @param table_name table that we are adding object into
     * @param payload object to be extended with extra fields
     */
    async _addRecord(table, payload) {
        const ulid = crypto.randomUUID(); 
        // create final object that should be added to the Dexie.js db
        const table_name = this.table_to_name.get(table);
        if (table_name == undefined) {
            return;
        }
        sync_worker.AddAdditionEvent(ulid, table_name, payload); // TODO, should we somehow secure that???
        
        payload.ulid = ulid;
        await table.add(payload);
    }

    /**
     * Get wallet assets in the form of array
     * @returns array of all records from the wallet_assets table 
     */
    async getWalletAssets() {
        try {
            var arr = await this.db.wallet_assets.toArray(); // get assets from table in form of array
            return arr;
        }
        catch (error) {
            console.error(error);
        }
    }

    /**
     * Retrieve element from the 
     * @param {number} index of element to be retrieved 
     * @returns simulation history record
     */
    async getSimResult(index) {
        try {
            var results = this.db.sim_history.get(index); // get the sim result by the id
            return results.data;
        }
        catch (error) {
            console.error(error);
        }
    }

    /**
     * Delete list of assets from the wallet
     * @param {Array} selected_ids ids of assets to be deleted 
     */
    async deleteWalletAssets(selected_ids) {
        try {
            this.dispatchRemoveEvents(this.db.wallet_assets, selected_ids);
            await this.db.wallet_assets.bulkDelete(selected_ids);
        }
        catch (error) {
            console.error(error);
        }
    }

    /**
     * Delete list of sims results specified by ids
     * @param {*} selected_ids ids to be removed
     */
    async deleteSimsResults(selected_ids) {
        try {            
            this.dispatchRemoveEvents(this.db.sim_history, selected_ids);
            await this.db.sim_history.bulkDelete(selected_ids);            
        }
        catch (error) {
            console.error(error);
        }
    }

    async dispatchRemoveEvents(table, selected_ids) {
        const records = await table.bulkGet(selected_ids);
        const table_name = this.table_to_name.get(table);
        records.forEach(e => {
            sync_worker.AddRemovalEvent(e.ulid, table_name);
        });
    }
};
