import * as crypto from "crypto";

const ALGO = "aes-128-cbc";
const KEY_LENGTH = 16; // bytes
const IV_LENGTH = 16;  // bytes

function getKeyFromHex(hexKey: string): Buffer {
  const key = Buffer.from(hexKey, "hex").slice(0, KEY_LENGTH);
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 8} bits)`);
  }
  return key;
}

export function encryptData(data: string, encryptionKeyHex: string) {
  const key = getKeyFromHex(encryptionKeyHex);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

export function decryptData(
  encryptedHex: string,
  encryptionKeyHex: string,
  ivHex: string
): string {
  const key = getKeyFromHex(encryptionKeyHex);
  const iv = Buffer.from(ivHex, "hex");
  const encryptedData = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return decrypted.toString("utf8");
}
