"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const crypto = require("crypto");
function encryptData(data, encryptionKeyHex) {
    const key = Buffer.from(encryptionKeyHex, "hex").slice(0, 16);
    if (key.length !== 16) {
        console.log(key.length);
        console.log(key);
        throw new Error("Key must be 16 bytes (128 bits) for AES-128-CBC");
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
        iv: iv.toString("hex"),
        encryptedData: encrypted,
    };
}
function decryptData(encryptedHex, encryptionKeyHex, ivHex) {
    const iv = Buffer.from(ivHex, "hex");
    const key = Buffer.from(encryptionKeyHex, "hex");
    if (key.length !== 16) {
        console.log(key.length);
        console.log(key);
        throw new Error("Key must be 16 bytes (128 bits) for AES-128-CBC");
    }
    const encryptedData = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}
//# sourceMappingURL=utils.js.map