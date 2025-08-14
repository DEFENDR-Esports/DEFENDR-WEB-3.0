export declare class CryptoService {
    private readonly logger;
    private readonly ALGORITHM;
    private readonly KEY_LENGTH;
    private readonly IV_LENGTH;
    private getKeyFromHex;
    private hexToBuffer;
    generateRandomKey(): string;
    generateRandomIV(): string;
    encryptData(data: string, encryptionKeyHex: string, ivHex?: string): {
        iv: string;
        encryptedData: string;
    };
    decryptData(encryptedHex: string, encryptionKeyHex: string, ivHex: string): string;
    generateKeyFromPassword(password: string, salt?: string): string;
    encryptWithPassword(data: string, password: string, salt?: string): {
        encryptedData: string;
        iv: string;
        salt: string;
    };
    decryptWithPassword(encryptedHex: string, password: string, ivHex: string, salt: string): string;
}
export interface EncryptDataDto {
    data: string;
    encryptionKeyHex: string;
    ivHex?: string;
}
export interface DecryptDataDto {
    encryptedHex: string;
    encryptionKeyHex: string;
    ivHex: string;
}
export interface EncryptWithPasswordDto {
    data: string;
    password: string;
    salt?: string;
}
export interface DecryptWithPasswordDto {
    encryptedHex: string;
    password: string;
    ivHex: string;
    salt: string;
}
export interface EncryptionResult {
    iv: string;
    encryptedData: string;
}
export interface PasswordEncryptionResult extends EncryptionResult {
    salt: string;
}
