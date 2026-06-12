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


async function getTableHash(table_name) {
    var db = getDBInstance();
    const table_name_hash = table_name + "_hash";
    const meta_table = db.table("metadata");
    const hash_obj = await meta_table.get(table_name_hash);
    return hash_obj.value;
}

/**
 * Take hashes of all tables and returns as object [name : hash]
 */
export async function getTablesHashes() {
    const wallet_hash = await getTableHash("wallet_assets");
    const sims_hash = await getTableHash("sim_history");
    return {
        "wallet_assets" : wallet_hash,
        "sim_history" : sims_hash,
    };
}


/**
 * Function to be used when data is being put into a db. It handles whole transaction's
 * process, first adds new record to proper db and then updates the table hash,
 * @param {*} db db_handle to be used
 * @param {*} table_name name of the table to be updated
 * @param {*} asset asset to be added to db
 */
export async function putDataToDb(db, table_name, asset) {
    var id = -1;
    await db.transaction(
        "rw",
        db.table(table_name),
        db.metadata,
        async () => {
            id = await db.table(table_name).put(asset);
            await updateHash(
                db,
                table_name,
                asset.hash,
            )
        }
    )
    return id;
}

/**
 * After appending record to db, we should also update table's hash
 * @param {*} table_name name of the table that hash should be updated
 * @param {*} xor_hash new hash to be xored with actual table's hash
 */
export async function updateHash(tx, table_name, xor_hash) {
    const table_name_hash = table_name + "_hash";
    const meta_table = tx.table("metadata");
    const hash_obj = await meta_table.get(table_name_hash);
    const og_hash = (!hash_obj) ? null : hash_obj.value;
    const new_hash = xorHashes(og_hash, xor_hash);
    meta_table.put({
        key: table_name_hash,
        value: new_hash,
    });
}

function xorHashes(h1, h2) {
    // if no hash yet, set as h2
    if (!h1) {
        return h2;
    }

    const b1 = hexToBytes(h1);
    const b2 = hexToBytes(h2);
    const out = new Uint8Array(b1.length);

    for (let i = 0; i < b1.length; i++) {
        out[i] = b1[i] ^ b2[i];
    }

    return bytesToHex(out);
}

function hexToBytes(hex) {
    return new Uint8Array(
        hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}