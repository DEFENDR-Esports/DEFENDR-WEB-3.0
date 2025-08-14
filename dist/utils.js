"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const crypto = require("crypto");
const ALGO = "aes-128-cbc";
const KEY_LENGTH = 16;
const IV_LENGTH = 16;
function getKeyFromHex(hexKey) {
    const key = Buffer.from(hexKey, "hex").slice(0, KEY_LENGTH);
    if (key.length !== KEY_LENGTH) {
        throw new Error(`Key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 8} bits)`);
    }
    return key;
}
function encryptData(data, encryptionKeyHex) {
    const key = getKeyFromHex(encryptionKeyHex);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
    return {
        iv: iv.toString("hex"),
        encryptedData: encrypted.toString("hex"),
    };
}
function decryptData(encryptedHex, encryptionKeyHex, ivHex) {
    const key = getKeyFromHex(encryptionKeyHex);
    const iv = Buffer.from(ivHex, "hex");
    const encryptedData = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted.toString("utf8");
}
//# sourceMappingURL=utils.js.map