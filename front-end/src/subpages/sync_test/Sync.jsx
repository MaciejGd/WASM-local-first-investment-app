import { DBEncryptor } from "../../db/db_encryptor";
import { sync } from "../../sync/synchronizer"
import { ulid } from "ulid";
import { useState } from "react";
import { RequestGET } from "../../Requests";


export default function SyncTest() {
    const [ulids, setUlids] = useState([]);

    function AddUlid(ulid) {
        const new_ulids = [...ulids, ulid];
        setUlids(new_ulids);
    }

    async function test1() {
        const payload = {
            "ticker" : "LPP.WA",
            "quantity" : 12.2,
            "price": 1.4,
        }
        const ulid = crypto.randomUUID();
        await sync.addAdditionToEventQueue(ulid, "wallet_assets", payload);
        // add ulid to list on success
        const ret = await sync.pushToRemote();
        if (ret == true) {
            AddUlid(ulid);
        }
    }

    async function get_data() {
        const ulid = ulids.at(-1);
        const endpoint = `http://127.0.0.1:5000/sync/get_record/wallet_assets/${ulid}`
        // in here we wanna fetch the data from the server and check if it can be properly removed
        var response = null;
        try {
            response = await RequestGET(endpoint);
        }
        catch (error) {
            console.log(error);
            return false;
        }
        console.log("Received record's data, received:\n", response);
        var payload = response.record.payload; // retrieve payload and decrypt it        
        var decoded_obj = await DBEncryptor.decrypt(payload); // decrypt data
        console.log("Decoded object:\n", decoded_obj);
        return true;
    }

    async function purge_events_table() {
        await sync.purgeTable("events");
    }

    async function purge_wallet_assets() {
        await sync.purgeTable("wallet_assets");
    }

    return (
    <>
        <h1>Sync Test</h1>
        <button onClick={test1}>Push data</button>        
        <button onClick={purge_wallet_assets}>Purge wallet assets</button>
        <button onClick={purge_events_table}>Purge events</button>
        <button onClick={get_data}>Get data</button>
    </>
    );
}
