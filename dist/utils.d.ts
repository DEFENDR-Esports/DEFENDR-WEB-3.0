export declare function encryptData(data: string, encryptionKey: string): {
    iv: string;
    authTag: string;
    encryptedData: string;
};
export declare function decryptData(encryptedHex: string, encryptionKey: string, ivHex: string, authTagHex: string): string;
