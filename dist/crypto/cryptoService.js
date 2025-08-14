"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CryptoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let CryptoService = CryptoService_1 = class CryptoService {
    constructor() {
        this.logger = new common_1.Logger(CryptoService_1.name);
        this.ALGORITHM = 'aes-256-cbc';
        this.KEY_LENGTH = 32;
        this.IV_LENGTH = 16;
    }
    getKeyFromHex(hexKey) {
        const key = Buffer.from(hexKey, 'hex');
        if (key.length !== this.KEY_LENGTH) {
            throw new common_1.BadRequestException(`Key must be exactly ${this.KEY_LENGTH} bytes (${this.KEY_LENGTH * 2} hex characters). Got ${key.length} bytes.`);
        }
        return key;
    }
    hexToBuffer(hex) {
        return Buffer.from(hex, 'hex');
    }
    generateRandomKey() {
        return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
    }
    generateRandomIV() {
        return crypto.randomBytes(this.IV_LENGTH).toString('hex');
    }
    encryptData(data, encryptionKeyHex, ivHex) {
        try {
            const key = this.getKeyFromHex(encryptionKeyHex);
            let iv;
            if (ivHex) {
                iv = this.hexToBuffer(ivHex);
                if (iv.length !== this.IV_LENGTH) {
                    throw new common_1.BadRequestException(`IV must be exactly ${this.IV_LENGTH} bytes (${this.IV_LENGTH * 2} hex characters). Got ${iv.length} bytes.`);
                }
            }
            else {
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
        }
        catch (error) {
            this.logger.error('Encryption failed', error.stack);
            throw new common_1.BadRequestException(`Encryption failed: ${error.message}`);
        }
    }
    decryptData(encryptedHex, encryptionKeyHex, ivHex) {
        try {
            const key = this.getKeyFromHex(encryptionKeyHex);
            const iv = this.hexToBuffer(ivHex);
            const encryptedData = this.hexToBuffer(encryptedHex);
            if (iv.length !== this.IV_LENGTH) {
                throw new common_1.BadRequestException(`IV must be exactly ${this.IV_LENGTH} bytes (${this.IV_LENGTH * 2} hex characters). Got ${iv.length} bytes.`);
            }
            const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
            const decrypted = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final()
            ]);
            this.logger.debug('Data decrypted successfully');
            return decrypted.toString('utf8');
        }
        catch (error) {
            this.logger.error('Decryption failed', error.stack);
            throw new common_1.BadRequestException(`Decryption failed: ${error.message}`);
        }
    }
    generateKeyFromPassword(password, salt = 'default_salt') {
        try {
            const key = crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
            return key.toString('hex');
        }
        catch (error) {
            this.logger.error('Key generation from password failed', error.stack);
            throw new common_1.BadRequestException(`Key generation failed: ${error.message}`);
        }
    }
    encryptWithPassword(data, password, salt) {
        try {
            const actualSalt = salt || crypto.randomBytes(16).toString('hex');
            const key = this.generateKeyFromPassword(password, actualSalt);
            const result = this.encryptData(data, key);
            return Object.assign(Object.assign({}, result), { salt: actualSalt });
        }
        catch (error) {
            this.logger.error('Password-based encryption failed', error.stack);
            throw new common_1.BadRequestException(`Password-based encryption failed: ${error.message}`);
        }
    }
    decryptWithPassword(encryptedHex, password, ivHex, salt) {
        try {
            const key = this.generateKeyFromPassword(password, salt);
            return this.decryptData(encryptedHex, key, ivHex);
        }
        catch (error) {
            this.logger.error('Password-based decryption failed', error.stack);
            throw new common_1.BadRequestException(`Password-based decryption failed: ${error.message}`);
        }
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = CryptoService_1 = __decorate([
    (0, common_1.Injectable)()
], CryptoService);
//# sourceMappingURL=cryptoService.js.map