import { sync } from "../../sync/synchronizer"

export default function SyncTest() {
    async function test1() {
        const payload = {
            "ticker" : "LPP.WA",
            "quantity" : 12.2,
            "price": 1.4,
        }
        sync.addAdditionToEventQueue(1, "wallet_assets", payload);
        await sync.pushToRemote();
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
    </>
    );
}
