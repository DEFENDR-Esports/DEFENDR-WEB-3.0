"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
const fs = require("fs");
let TokenService = TokenService_1 = class TokenService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(TokenService_1.name);
        this.tokenIdFile = 'defendr-r.tokenid';
        const network = this.config.get('HEDERA_NETWORK') || 'testnet';
        const operatorId = sdk_1.AccountId.fromString(this.config.get('OPERATOR_ID'));
        const operatorKeyString = this.config.get('OPERATOR_KEY');
        this.operatorKey = sdk_1.PrivateKey.fromString(operatorKeyString);
        this.client = network === 'mainnet' ? sdk_1.Client.forMainnet() : sdk_1.Client.forTestnet();
        this.client.setOperator(operatorId, this.operatorKey);
    }
    async onModuleInit() {
        const tokenId = await this.createTokenIfNotExists();
        this.logger.log(`DEFENDR-R Token ID: ${tokenId}`);
    }
    async createTokenIfNotExists() {
        if (fs.existsSync(this.tokenIdFile)) {
            const existingTokenId = fs.readFileSync(this.tokenIdFile, 'utf8');
            this.logger.log(`Token already created with ID: ${existingTokenId}`);
            return existingTokenId.trim();
        }
        const treasuryIdString = this.config.get('TREASURY_ACCOUNT_ID');
        if (!treasuryIdString) {
            throw new Error('TREASURY_ACCOUNT_ID is not defined in config');
        }
        const treasuryId = sdk_1.AccountId.fromString(treasuryIdString);
        const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
        if (!supplyKeyString) {
            throw new Error('SUPPLY_PRIVATE_KEY is not defined in config');
        }
        const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
        const tx = await new sdk_1.TokenCreateTransaction()
            .setTokenName('DEFENDR-R')
            .setTokenSymbol('DFR')
            .setTokenType(sdk_1.TokenType.FungibleCommon)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(treasuryId)
            .setSupplyType(sdk_1.TokenSupplyType.Infinite)
            .setSupplyKey(supplyKey)
            .setMaxTransactionFee(new sdk_1.Hbar(10))
            .freezeWith(this.client);
        const signedTx = await tx.sign(this.operatorKey);
        const response = await signedTx.execute(this.client);
        const receipt = await response.getReceipt(this.client);
        const tokenId = receipt.tokenId.toString();
        fs.writeFileSync(this.tokenIdFile, tokenId);
        this.logger.log(`Created new token with ID: ${tokenId}`);
        return tokenId;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TokenService);
//# sourceMappingURL=token.service.js.map