export declare function encryptData(data: string, encryptionKeyHex: string): {
    iv: string;
    encryptedData: string;
};
export declare function decryptData(encryptedHex: string, encryptionKeyHex: string, ivHex: string): string;
