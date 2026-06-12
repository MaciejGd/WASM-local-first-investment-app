/**
 * Helper class for handling db's records encryption/decryption
 */
export class DBEncryptor {
  static IV_LENGTH = 12; // for AES-CGM encryption, initialization vector has size 12
  static KEY = null;
  static SALT = null;

  constructor() {}

  /**
   * Stringify and encode JS object
   * @param {*} object object to be encoded
   * @returns stringified and encoded object
   */
  static _encodeObject(object) {
    var enc_obj = JSON.stringify(object);
    return new TextEncoder().encode(enc_obj);
  }

  /**
   * Decode hash string into a JS object
   * @param {*} code hash to be decoded
   * @returns JSON string parsed to object
   */
  static _decodeObject(code) {
    var dec_str = new TextDecoder().decode(code);
    return JSON.parse(dec_str);
  }

  /**
   * Encrypt object with given encryption key
   * @param {*} object object to be encrypted
   * @param {*} key encrypting key to be used
   * @param {*} iv initalization vector that should be used for encryption
   * @returns True if encryption succeed, False otherwise
   */
  static async encrypt(object) {
    const iv = DBEncryptor.generateIV();

    var encrypted_message = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      DBEncryptor.KEY,
      this._encodeObject(object),
    );

    const encypted_bytes = new Uint8Array(encrypted_message);

    const packed = new Uint8Array(iv.length + encypted_bytes.length);

    packed.set(iv, 0);
    packed.set(encypted_bytes, iv.length);

    return DBEncryptor.buffToString(packed);
  }

  /**
   * Decrypt message from the DB
   * @param {*} msg message to be decrypted
   * @param {*} key decryption key
   * @returns decoded object
   */
  static async decrypt(msg) {
    // generate initialization vector
    var packed = DBEncryptor.stringToBuff(msg);
    const iv = packed.slice(0, 12); // retrieve 12 first bytes for iv
    const encrypted_msg = packed.slice(12); // get payload

    var decrypted_message = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      DBEncryptor.KEY,
      encrypted_msg,
    );
    return this._decodeObject(decrypted_message);
  }

  /**
   *  Turn array buffer into a string encoded with base64
   * @param {ArrayBuffer} buffer data to be encoded to string
   * @returns encoded string
   */
  static buffToString(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Transform base64 encoded string to array of Uint8s
   * @param {*} msg
   * @returns
   */
  static stringToBuff(msg) {
    const binaryString = atob(msg);

    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  /**
   * Generate key material from the password
   * @param {string} passwd password from which key material would be generated
   * @returns raw key material for PBKDF2 derivation method
   */
  static async _generateKeyMaterial(passwd) {
    const enc = new TextEncoder();
    return await crypto.subtle.importKey(
      "raw",
      enc.encode(passwd),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"],
    );
  }

  /**
   * Derive key from the password using PBKDF2 for AES-GCM
   * @param {string} passwd password to be generated for the encr
   * @param {string} salt unique 16 bytes for key generation
   */
  static async generateKey(passwd, salt) {
    const example_salt = new Uint8Array(16).fill(1); // example salt, 18 ones TODO, remove that
    const keyMaterial = await this._generateKeyMaterial(passwd);
    DBEncryptor.KEY = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: example_salt,
        iterations: 1000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  }

  static generateIV() {
    return crypto.getRandomValues(new Uint8Array(DBEncryptor.IV_LENGTH));
  }

  static setSalt(salt) {
    DBEncryptor.SALT = salt;
  }
}
