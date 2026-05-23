import { Dexie } from "dexie";

// shared IndexedDb instance
let dbInstance = null;

// Function for creating a handle to IndexedDB
export function getDBInstance() {
    if (dbInstance) {
        return dbInstance
    }

    const db = new Dexie("myDatabase");

    db.version(2).stores({
        wallet_assets: "&ulid",
        sim_history: "++id",
        out_events: "++id",
        metadata: "&key",
    });

    dbInstance = db;

    return dbInstance;
}