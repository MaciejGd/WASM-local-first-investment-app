/**
 * Singletor class for handling storing key + salt needed for data encryption
 */
class AppEncryptor {
  instance = null;
  constructor() {
    if (AppEncryptor.instance !== null) {
      return;
    }
    AppEncryptor.instance = this;
    this.key = null;
    this.salt = null;
  }

  setSalt(salt) {
    this.salt = salt;
  }

  _getKeyMaterial(password) {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"],
    );
  }

  async generateAESKey(password, salt) {
    const keyMaterial = this._getKeyMaterial(password);
    this.key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 1000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  }
}
