import { Dexie } from "dexie";
import hash from "object-hash";

/**
 * Singleton handler for DB interacations.
 */
export class IndexedDbHandler {
    static instance;
    constructor() {
        if (IndexedDbHandler.instance) {
            return IndexedDbHandler.instance; // if already initialized
        }
        this.db = new Dexie("myDatabase");
        // database initialization
        this.db.version(1).stores({
            meta: "++id",
            wallet_assets: "++id, ticker, quantity, price", // collection of assets compounding on wallet
            sim_history: "++id" // collection of simulations run
        });
        this.version_id = 0;
        this.initializeMeta(); // initialize metadata
        IndexedDbHandler.instance = this;
    }

    /**
     * Initialize metadata of the db
     */
    async initializeMeta() {
        var version = -1;
        try {
            version = await this.db.meta.orderBy("id").last(); // get first record from the db
            if (version === undefined) {
                version = await this.db.meta.add({"version" : 0});
            }
            await this.db.meta.update(0, version + 1);
        }
        catch (error) {
            console.error(error);
        }
        this.version_id = version;        
    }

    /**
     * Add simulation history if it does not already exists in db
     * @param {Object} payload object holding simulation's data
     */
    async addSimsHistory(payload) {
        try {
            // add hash to payload
            payload.hash = this.hashSimsHistory(payload);
            console.log(payload.hash);
            // check if hash already in db
            var sims_stored = await this.db.sim_history.toArray();
            for (let i = 0; i < sims_stored.length; i++) {
                if (sims_stored[i].hash === payload.hash) {
                    return false;
                }
            }
            await this.db.sim_history.add(payload);
            this._updateVersion();
        }
        catch (error) {
            console.error(error);
            return false;
        }
        return true;

    }

    /**
     * 
     * @param {*} payload 
     * @returns 
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
    async addWalletAsset(ticker, quantity, price) {
        try {
            var ret = await this.db.wallet_assets.add({
                ticker, quantity, price
            });
            this._updateVersion();
            return ret;
        }
        catch (error) {
            console.error(error);
        }
    }

    /**
     * Get wallet assets in the form of array
     * @returns array of all records from the wallet_assets table 
     */
    async getWalletAssets() {
        try {
            var arr = await this.db.wallet_assets.toArray(); // get assets from table in form of array
            this._updateVersion();
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
    async getGetSimResult(index) {
        try {
            var results = this.db.sim_history.get(index); // get the sim result by the id
            this._updateVersion();
            return results;
        }
        catch (error) {
            console.error(error);
        }
    }

    /**
     * Update version of db. Should be called after each db operation.
     */
    async _updateVersion() {
        try {
            // increment version number
            var current = await this.db.meta.orderBy("id").last();
            await this.db.meta.update(this.version_id, {
                version: (current?.version || 0) + 1
            });
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
            await db.wallet_assets.bulkDelete(selected_ids);
            this._updateVersion();
        }
        catch (error) {
            console.log(error);
        }
    }

};

