import { test, expect, vi, describe, afterEach } from "vitest";
import { DBEncryptor } from "../../src/db/db_encryptor";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("_encodeObject", () => {
  test("correctly encodes example object", () => {
    const ret = DBEncryptor._encodeObject({ test: "test", test1: "test1" });
    expect(ret).toEqual(
      new Uint8Array([
        123, 34, 116, 101, 115, 116, 34, 58, 34, 116, 101, 115, 116, 34, 44, 34,
        116, 101, 115, 116, 49, 34, 58, 34, 116, 101, 115, 116, 49, 34, 125,
      ]),
    );
  });
});

describe("_decodeObject", () => {
  test("correctly encodes example object", () => {
    const ret = DBEncryptor._decodeObject(new Uint8Array([
        123, 34, 116, 101, 115, 116, 34, 58, 34, 116, 101, 115, 116, 34, 44, 34,
        116, 101, 115, 116, 49, 34, 58, 34, 116, 101, 115, 116, 49, 34, 125,
      ]));
    expect(ret).toEqual({ test: "test", test1: "test1" });
  });
});

describe("encrypt", () => {
  test("encryption works correctly", async () => {
    vi.spyOn(crypto.subtle, 'encrypt').mockResolvedValue(new Uint8Array([1,2,3,4]).buffer);

    const generateIV_spy = vi.spyOn(DBEncryptor, '_generateIV').mockReturnValue([5,6]);
    const buffToString_spy = vi.spyOn(DBEncryptor, 'buffToString').mockReturnValue(undefined);

    const res = await DBEncryptor.encrypt({ test: "test", test1: "test1" });
    expect(buffToString_spy).toHaveBeenCalledWith(new Uint8Array([5,6,1,2,3,4]));
  });
});

describe("decrypt", () => {
  test("decryption works correctly", async () => {
    const spy_mock = vi.spyOn(crypto.subtle, 'decrypt').mockResolvedValue(new Uint8Array([1,2,3,4]));

    const stringToBuff_spy = vi.spyOn(DBEncryptor, 'stringToBuff').mockReturnValue([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

    const _decodeObject_spy = vi.spyOn(DBEncryptor, '_decodeObject').mockReturnValue({ decoded: true });

    const res = await DBEncryptor.decrypt("test");
    expect(_decodeObject_spy).toHaveBeenCalledWith(new Uint8Array([1,2,3,4]));
    expect(spy_mock).toHaveBeenCalledWith(
        {
          "iv": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
          ],
          "name": "AES-GCM",
        },
        null,
        [
          13,
          14,
          15,
        ],
    );
  });
});

describe("buffToString", () => {
  test("correctly turn ArrayBuffer to string", () => {
    const str = DBEncryptor.buffToString(new Uint8Array([1,2,3,4]))
    expect(str).toBe("AQIDBA==");
  })
})

describe("stringToBuff ", () => {
  test("correctly turn string to ArrayBuffer", () => {
    const str = DBEncryptor.stringToBuff("new test")
    expect(str).toEqual(
      new ArrayBuffer([
        -99,
        -20,
        45,
        122,
        -53,
      ]));
  })
})

describe("_generateKeyMaterial ", () => {
  test("correctly turn ArrayBuffer to string", async () => {
    const importKey_mock = vi.spyOn(crypto.subtle, "importKey");

    await DBEncryptor._generateKeyMaterial("test");
    expect(importKey_mock).toHaveBeenCalledWith(
       "raw",
       new Uint8Array ([
         116,
         101,
         115,
         116,
       ]),
       "PBKDF2",
       false,
       [
         "deriveBits",
         "deriveKey",
       ]
    );
  })
})

describe("generateKey", () => {
  test("keys properly generated from password and salt", async () => {

    const genkey_mock = vi.spyOn(crypto.subtle, "deriveKey").mockResolvedValue("example_key");
    const keyMaterial_spy = vi.spyOn(DBEncryptor, '_generateKeyMaterial').mockResolvedValue("test");

    await DBEncryptor.generateKey("test", "salt");

    expect(DBEncryptor.KEY).toBe("example_key");
    expect(genkey_mock).toHaveBeenCalledExactlyOnceWith(
      {
        "hash": "SHA-256",
        "iterations": 1000,
        "name": "PBKDF2",
        "salt": "salt",
      },
      "test",
      {
        "length": 256,
        "name": "AES-GCM",
      },
      true,
      [
        "encrypt",
        "decrypt",
      ],
    );
  })
})

describe("_generateIV", () => {
  test("returning array filled with random values", () => {
    const example_iv = new Uint8Array([
      1,2,3,4,5,6,7,8,9,10,11,12
    ]);
    const random_mock = vi.spyOn(crypto, "getRandomValues").mockReturnValue(example_iv);
    const res = DBEncryptor._generateIV();
    expect(res).toEqual(example_iv);
  })
})

describe("setSalt", () => {
  test("setting salt works correctly", (() => {
    DBEncryptor.setSalt("test");
    expect(DBEncryptor.SALT).toBe("test");
  }))
})