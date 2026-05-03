
/**
 * Helper class for handling db's records encryption/decryption
 */
export class DBEncryptor {
    iv_length = 12; // for AES-CGM encryption, initialization vector has size 12
    constructor() {
    }

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
     * @param {*} salt salt used for encryption
     * @returns True if encryption succeed, False otherwise
     */
    static async encrypt(object, key, iv) {
        var encrypted_message = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv}, 
            key, 
            this._encodeObject(object)
        );
        return encrypted_message;
    }

    /**
     * Decrypt message from the DB
     * @param {*} msg message to be decrypted
     * @param {*} key decryption key
     * @param {*} salt salt used for encryption
     * @returns decoded object
     */
    static async decrypt(msg, key, iv) {
        var decrypted_message = await crypto.subtle.decrypt(
            {name: "AES-GCM", iv}, 
            key, 
            msg);
        return this._decodeObject(decrypted_message);
    }


    static generateIV() {
        return crypto.getRandomValues(new Uint8Array(iv_length));
    }
};

