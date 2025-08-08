 
import * as crypto from 'crypto';

export function encryptData(data: string, encryptionKey: string) {
  const iv = crypto.randomBytes(12); // GCM standard IV length
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

export function decryptData(
  encryptedHex: string,
  encryptionKey: string,
  ivHex: string,
  authTagHex: string
) {
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
