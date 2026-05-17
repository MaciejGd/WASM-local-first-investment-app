import { DBEncryptor } from "../db/db_encryptor";
import { DBSynchronizer } from "./synchronizer";


const sync = new DBSynchronizer();

onmessage = async (e) => {
    const data = e.data;
    // TODO, should we handle exceptions in here???
    if (data.type == "add") {
        await sync.addAdditionToEventQueue(data.ulid, data.table_name, data.payload);
    }
    else if (data.type == "del") {
        await sync.addRemovalToEventQueue(data.ulid, data.table_name);
    }
    else if (data.type == "crypto_init") {
        // generate key based on password provided
        await DBEncryptor.generateKey(data.passwd, data.salt);
    }
}

setInterval(() => sync.pushToRemote(), 3000);