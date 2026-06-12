import { DBEncryptor } from "../../db/db_encryptor";
import { sync } from "../../sync/synchronizer";
import { ulid } from "ulid";
import { useState } from "react";
import { RequestGET } from "../../Requests";
import { sync_worker } from "../../sync/syncWorkerWrapper";

export default function SyncTest() {
  const [ulids, setUlids] = useState([]);

  function AddUlid(ulid) {
    const new_ulids = [...ulids, ulid];
    setUlids(new_ulids);
  }

  async function test1() {
    const payload = {
      ticker: "LPP.WA",
      quantity: 12.2,
      price: 1.4,
    };
    const ulid = crypto.randomUUID();
    await AddAdditionEvent(ulid, "wallet_assets", payload);
    // add ulid to list on success
    if (ret == true) {
      AddUlid(ulid);
    }
  }

  async function get_data() {
    const ulid = ulids.at(-1);
    const endpoint = `http://127.0.0.1:5000/sync/get_record/wallet_assets/${ulid}`;
    // in here we wanna fetch the data from the server and check if it can be properly removed
    var response = null;
    try {
      response = await RequestGET(endpoint);
    } catch (error) {
      console.log(error);
      return false;
    }
    console.log("Received record's data, received:\n", response);
    var payload = response.record.payload; // retrieve payload and decrypt it
    var decoded_obj = await DBEncryptor.decrypt(payload); // decrypt data
    console.log("Decoded object:\n", decoded_obj);
    return true;
  }

  async function get_events_from() {
    var ev_endpoint = "http://127.0.0.1:5000/sync/pull_events/";
    var response = null;
    try {
      response = await RequestGET(ev_endpoint + "74");
    } catch (error) {
      console.log(error);
      return;
    }
    console.log(response);
    for (let i = 0; i < response.length; i++) {
      var event = response[i];
      if (event.payload !== null) {
        var payload = await DBEncryptor.decrypt(event.payload);
        console.log(payload);
      }
    }
  }

  return (
    <>
      <h1>Sync Test</h1>
      <button onClick={test1}>Push data</button>
      <button onClick={get_data}>Get data</button>
      <button onClick={get_events_from}>Get events</button>
    </>
  );
}
