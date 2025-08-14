import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  // ===== Constants =====
  private readonly ALGORITHM = 'aes-256-cbc'; // Changed to match your decrypt function
  private readonly KEY_LENGTH = 32; // 256-bit key (changed from 16 to match aes-256-cbc)
  private readonly IV_LENGTH = 16;  // 128-bit IV

  // ===== Helper Methods =====
  private getKeyFromHex(hexKey: string): Buffer {
    const key = Buffer.from(hexKey, 'hex');
    if (key.length !== this.KEY_LENGTH) {
      throw new BadRequestException(
        `Key must be exactly ${this.KEY_LENGTH} bytes (${this.KEY_LENGTH * 2} hex characters). Got ${key.length} bytes.`
      );
    }
    return key;
  }

  private hexToBuffer(hex: string): Buffer {
    return Buffer.from(hex, 'hex');
  }

  // ===== Public Methods =====

  /**
   * Generate a random encryption key
   * @returns {string} 64-character hex string (32 bytes)
   */
  generateRandomKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  /**
   * Generate a random IV
   * @returns {string} 32-character hex string (16 bytes)
   */
  generateRandomIV(): string {
    return crypto.randomBytes(this.IV_LENGTH).toString('hex');
  }

  /**
   * Encrypt data using AES-256-CBC
   * @param data - Plain text to encrypt
   * @param encryptionKeyHex - 32-byte key in hex format (64 hex characters)
   * @param ivHex - Optional IV in hex format. If not provided, random IV is generated
   * @returns Object with encryptedData and iv in hex format
   */
  encryptData(
    data: string, 
    encryptionKeyHex: string, 
    ivHex?: string
  ): { iv: string; encryptedData: string } {
    try {
      const key = this.getKeyFromHex(encryptionKeyHex);
      
      // Generate or use provided IV
      let iv: Buffer;
      if (ivHex) {
        iv = this.hexToBuffer(ivHex);
        if (iv.length !== this.IV_LENGTH) {
          throw new BadRequestException(
            `IV must be exactly ${this.IV_LENGTH} bytes (${this.IV_LENGTH * 2} hex characters). Got ${iv.length} bytes.`
          );
        }
      } else {
        iv = crypto.randomBytes(this.IV_LENGTH);
      }

      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final()
      ]);

      const result = {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
      };

      this.logger.debug(`Data encrypted successfully. IV: ${result.iv}`);
      return result;

    } catch (error) {
      this.logger.error('Encryption failed', error.stack);
      throw new BadRequestException(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   * @param encryptedHex - Encrypted data in hex format
   * @param encryptionKeyHex - 32-byte key in hex format (64 hex characters)
   * @param ivHex - 16-byte IV in hex format (32 hex characters)
   * @returns Decrypted plain text
   */
  decryptData(
    encryptedHex: string,
    encryptionKeyHex: string,
    ivHex: string
  ): string {
    try {
      const key = this.getKeyFromHex(encryptionKeyHex);
      const iv = this.hexToBuffer(ivHex);
      const encryptedData = this.hexToBuffer(encryptedHex);

      if (iv.length !== this.IV_LENGTH) {
        throw new BadRequestException(
          `IV must be exactly ${this.IV_LENGTH} bytes (${this.IV_LENGTH * 2} hex characters). Got ${iv.length} bytes.`
        );
      }

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ]);

      this.logger.debug('Data decrypted successfully');
      return decrypted.toString('utf8');

    } catch (error) {
      this.logger.error('Decryption failed', error.stack);
      throw new BadRequestException(`Decryption failed: ${error.message}`);
    }
  }

  // ===== Password-based Methods (Optional) =====

  /**
   * Generate a key from password using PBKDF2
   * @param password - User password
   * @param salt - Salt for key derivation (default: "default_salt")
   * @returns 32-byte key in hex format
   */
  generateKeyFromPassword(password: string, salt: string = 'default_salt'): string {
    try {
      const key = crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
      return key.toString('hex');
    } catch (error) {
      this.logger.error('Key generation from password failed', error.stack);
      throw new BadRequestException(`Key generation failed: ${error.message}`);
    }
  }

  /**
   * Encrypt using password
   * @param data - Plain text to encrypt
   * @param password - User password
   * @param salt - Optional salt for key derivation
   * @returns Object with encryptedData, iv, and salt
   */
  encryptWithPassword(
    data: string, 
    password: string, 
    salt?: string
  ): { encryptedData: string; iv: string; salt: string } {
    try {
      const actualSalt = salt || crypto.randomBytes(16).toString('hex');
      const key = this.generateKeyFromPassword(password, actualSalt);
      const result = this.encryptData(data, key);
      
      return {
        ...result,
        salt: actualSalt
      };
    } catch (error) {
      this.logger.error('Password-based encryption failed', error.stack);
      throw new BadRequestException(`Password-based encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt using password
   * @param encryptedHex - Encrypted data in hex format
   * @param password - User password
   * @param ivHex - IV in hex format
   * @param salt - Salt used for key derivation
   * @returns Decrypted plain text
   */
  decryptWithPassword(
    encryptedHex: string,
    password: string,
    ivHex: string,
    salt: string
  ): string {
    try {
      const key = this.generateKeyFromPassword(password, salt);
      return this.decryptData(encryptedHex, key, ivHex);
    } catch (error) {
      this.logger.error('Password-based decryption failed', error.stack);
      throw new BadRequestException(`Password-based decryption failed: ${error.message}`);
    }
  }
}

// ===== DTOs (Optional - for API endpoints) =====

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