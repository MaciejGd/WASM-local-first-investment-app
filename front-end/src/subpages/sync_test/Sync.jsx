import { sync } from "../../sync/synchronizer"

export default function SyncTest() {
    async function test1() {
        sync.addAdditionToEventQueue(1, "test", "test");
        await sync.pushToRemote();
    }   

    function test2() {

    }

    return (
    <>
        <h1>Sync Test</h1>
        <button onClick={test1}>Reset table</button>
        <button onClick={test2}>Push data</button>
    </>
    );
}
