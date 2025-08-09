 
import * as crypto from 'crypto';
 

export function encryptData(data: string, encryptionKeyHex: string) {
  // AES-128 requires 16-byte key (128 bits)
  // Ensure your encryptionKey is exactly 32 hex chars (16 bytes)
  const key = Buffer.from(encryptionKeyHex, "hex").slice(0,16);
  if (key.length !== 16) {
    console.log(key.length)
    console.log(key)
    throw new Error("Key must be 16 bytes (128 bits) for AES-128-CBC");
  }

  const iv = crypto.randomBytes(16); // 16 bytes IV for CBC
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
}


export function decryptData(
  encryptedHex: string,
  encryptionKeyHex: string,
  ivHex: string
): string {
  const iv = Buffer.from(ivHex, "hex");
  const key = Buffer.from(encryptionKeyHex, "hex"); 
  if (key.length !== 16) {
    console.log(key.length)
    console.log(key)
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
