/**
 * Wrapper used for communication from main thread with Sync Worker
 */
export class SyncWorkerWrapper {
  static #instance = null;

  constructor() {
    if (SyncWorkerWrapper.#instance) {
      return SyncWorkerWrapper.#instance;
    }
    this.worker = this.initWorker();
    SyncWorkerWrapper.#instance = this;
  }

  static getInstance() {
    if (!SyncWorkerWrapper.#instance) {
      return new SyncWorkerWrapper();
    }
    return SyncWorkerWrapper.#instance;
  }

  /**
   * Initialize sync worker.
   * @returns initialized worker
   */
  initWorker() {
    const worker = new Worker(new URL("./syncWorker.js", import.meta.url), {
      type: "module",
    });

    return worker;
  }

  /**
   * Generate crypto key for sync worker, based on provided password and salt.
   * @param {string} passwd password to be used for generating encryption key
   * @param {ArrayBuffer} salt salt used for generating encryption key
   */
  async InitCrypto(passwd, salt) {
    this.worker.postMessage({
      type: "crypto_init",
      passwd: passwd,
      salt: salt,
    });
  }

  /**
   * Add event with new data addition to event's queue
   * @param {string} ulid unique identifier of added record
   * @param {string} table_name name of the table to be modified
   * @param {string} hash hash of the object for checking object compliance
   * @param {object} payload data to be added to db
   */
  async AddAdditionEvent(ulid, table_name, hash, payload) {
    this.worker.postMessage({
      type: "add",
      ulid: ulid,
      table_name: table_name,
      hash: hash,
      payload: payload,
    });
  }

  /**
   * Add event for data removal to event's queue
   * @param {string} ulid unique identifier of removed record
   * @param {string} table_name name of the table to be modified
   */
  async AddRemovalEvent(ulid, table_name) {
    this.worker.postMessage({
      type: "del",
      ulid: ulid,
      table_name: table_name,
    });
  }

  async purgeTable(table_name) {
    this.worker.postMessage({
      type: "purge",
      table_name: table_name,
    });
  }

  /**
   * Request to sync tables with remote source of truth 
  */
  async syncTables() {
    this.worker.postMessage({
      type: "sync",
    });
  }
}
