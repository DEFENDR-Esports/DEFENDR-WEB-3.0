"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const crypto = require("crypto");
function encryptData(data, encryptionKey) {
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(encryptionKey, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encryptedData: encrypted.toString('hex'),
    };
}
function decryptData(encryptedHex, encryptionKey, ivHex, authTagHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(encryptionKey, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedData = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
//# sourceMappingURL=utils.js.map