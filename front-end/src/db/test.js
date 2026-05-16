/**
 * Encode string to array of chars
 * @param {*} str string to be encoded to array of chars 
 * @returns array of chars
 */
const _stringToArrayBuffer = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
};

/**
 * hash string with SHA-256
 * @returns message hashed with SHA-256
 */
const _digestMessage = async (message) => {
    const data = _stringToArrayBuffer(message);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return hash;
};

/**
 * Take buffer of hex'es, turn into a string with 
 * @param {*} buffer chars buffer turned into a hex string
 * @returns 
 */
const _arrayBufferToHexString = (buffer) => {
    const byteArray = new Uint8Array(buffer);
    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });

    return hexCodes.join('');
};



/**
 * Dervie the encryption key from the passphrase
 * @param {*} passphrase passphrase to be used for deriving the key
 * @returns encoded passphrase
 */
export const getKeyFromPassphrase = async (passphrase) => {
    const key = await _digestMessage(passphrase);
    const keyHex = _arrayBufferToHexString(key);
    return keyHex;
};


function encodeValue(value) {
    var msg = JSON.stringify(value);
    return new TextEncoder().encode(msg);
}

var test_val = {
    "test" : 2,
    "new_test": [ 2, "test", "pbk"],
};

var key = await crypto.subtle.generateKey(
    {
        name: "AES-GCM",
        length: 256,
    },
    true,
    ["encrypt", "decrypt"],
);


var iv = crypto.getRandomValues(new Uint8Array(12));
var encrypted_message = await crypto.subtle.encrypt({name: "AES-GCM", iv}, key, encodeValue(test_val));
console.log(encrypted_message);

var decrypted_message = await crypto.subtle.decrypt({name: "AES-GCM", iv}, key, encrypted_message);
console.log(new TextDecoder().decode(decrypted_message));
var decoded = new TextDecoder().decode(decrypted_message);
console.log(JSON.parse(decoded));


// so the whole pipeline looks like below:
// 1. we encode the object using JSON.stringify + TextEncoder