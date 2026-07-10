import { SimulationAPI } from "./wasm/SimulationAPI.js";
import { useEffect, useState, useRef } from "react";

/**
 * * For the debug purposes we may want to run SimulationAPI sequencially.
 * Because of that some kind of sequencial worker imitating WebWorker behavior should be introduced
 *
 * @param {Function} onMessage callback to be executed on simulation end
 * @returns
 */
export function useSequencialWorker() {
  const [simAPI, setSimAPI] = useState(null);

  useEffect(() => {
    SimulationAPI.create().then((module) => {
      if (module) {
        setSimAPI(module);
      }
    });
  }, []);

  const simTerminate = () => {
    return;
  };

  const simRun = (payload) => {
    simAPI.runSimulation(
      payload.stockData,
      payload.weights,
      payload.times,
      payload.sims,
    );
  };

  return { simRun, simTerminate };
}

/**
 * Custom hook for managing Simulation WebWorker
 * @param {Function} onMessage callback to be executed on simulation end
 * @returns returns pair of functions to be called on worker, run and terminate
 */
export function useSimulationWorker(onMessage) {
  const workerRef = useRef(null); // worker instance

  useEffect(() => {
    // initialize worker on mount
    initWorker();
    // cleanup on unmounting
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const initWorker = () => {
    const worker = new Worker(
      new URL("./wasm/SimulationWorker.js", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (e) => {
      onMessage?.(e.data);
    };
    workerRef.current = worker;
    worker.postMessage({
      type: "INIT",
    });
  };
  /**
   * Terminate and reinitailize worker
   */
  const simTerminate = () => {
    workerRef.current?.terminate();
    initWorker(); // initialize the worker again
  };

  const simRun = (payload) => {
    if (!workerRef.current) {
      console.error(
        "Web worker for WASM Simulations has not been yet initialized!",
      );
      return;
    }
    workerRef.current.postMessage({
      type: "RUN",
      payload: payload,
    });
  };

  return { simRun, simTerminate };
}
