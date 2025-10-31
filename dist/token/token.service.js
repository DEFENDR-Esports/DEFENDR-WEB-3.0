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
        this.tokenIdFile = 'defendr-b.tokenid';
        const network = this.config.get('HEDERA_NETWORK') || 'testnet';
        this.operatorId = sdk_1.AccountId.fromString(this.config.get('OPERATOR_ID'));
        const operatorKeyString = this.config.get('OPERATOR_KEY');
        this.operatorKey = sdk_1.PrivateKey.fromString(operatorKeyString);
        this.client = network === 'mainnet' ? sdk_1.Client.forMainnet() : sdk_1.Client.forTestnet();
        this.client.setOperator(this.operatorId, this.operatorKey);
    }
    async onModuleInit() {
        const tokenId = await this.createTokenIfNotExists();
        this.logger.log(`DEFENDR-B Token ID: ${tokenId}`);
    }
    async createTokenIfNotExists() {
        if (fs.existsSync(this.tokenIdFile)) {
            const existingTokenId = fs.readFileSync(this.tokenIdFile, 'utf8');
            this.logger.log(`Token already exists with ID: ${existingTokenId}`);
            return existingTokenId.trim();
        }
        const treasuryIdString = this.config.get('TREASURY_ACCOUNT_ID');
        if (!treasuryIdString)
            throw new Error('TREASURY_ACCOUNT_ID is not defined');
        const treasuryId = sdk_1.AccountId.fromString(treasuryIdString);
        const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
        if (!supplyKeyString)
            throw new Error('SUPPLY_PRIVATE_KEY is not defined');
        const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
        const kycKeyString = this.config.get('KYC_PRIVATE_KEY');
        const kycKey = kycKeyString ? sdk_1.PrivateKey.fromString(kycKeyString) : undefined;
        const freezeKeyString = this.config.get('FREEZE_PRIVATE_KEY');
        const freezeKey = freezeKeyString ? sdk_1.PrivateKey.fromString(freezeKeyString) : undefined;
        const tokenType = this.config.get('TOKEN_TYPE') === 'NFT' ? sdk_1.TokenType.NonFungibleUnique : sdk_1.TokenType.FungibleCommon;
        const initialSupply = tokenType === sdk_1.TokenType.FungibleCommon ? 0 : 0;
        const tx = await new sdk_1.TokenCreateTransaction()
            .setTokenName('DEFENDR-B')
            .setTokenSymbol('DFB')
            .setTokenType(tokenType)
            .setDecimals(tokenType === sdk_1.TokenType.FungibleCommon ? 0 : undefined)
            .setInitialSupply(initialSupply)
            .setTreasuryAccountId(treasuryId)
            .setSupplyType(sdk_1.TokenSupplyType.Infinite)
            .setSupplyKey(supplyKey)
            .setKycKey(kycKey)
            .setFreezeKey(freezeKey)
            .setMaxTransactionFee(new sdk_1.Hbar(10))
            .freezeWith(this.client);
        const signedTx = await tx.sign(this.operatorKey);
        const response = await signedTx.execute(this.client);
        const receipt = await response.getReceipt(this.client);
        const tokenId = receipt.tokenId;
        fs.writeFileSync(this.tokenIdFile, tokenId.toString());
        this.logger.log(`Created DEFENDR-B token with ID: ${tokenId}`);
        return tokenId.toString();
    }
    async createDefendrRToken() {
        try {
            const tokenIdFile = 'defendr-r.tokenid';
            if (fs.existsSync(tokenIdFile)) {
                const existingTokenId = fs.readFileSync(tokenIdFile, 'utf8').trim();
                this.logger.log(`DEFENDR-R token already exists: ${existingTokenId}`);
                return {
                    tokenId: existingTokenId,
                    transactionId: '',
                    associated: true,
                };
            }
            const treasuryIdString = this.config.get('TREASURY_ACCOUNT_ID');
            if (!treasuryIdString)
                throw new Error('TREASURY_ACCOUNT_ID is not defined');
            const treasuryId = sdk_1.AccountId.fromString(treasuryIdString);
            const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
            if (!supplyKeyString)
                throw new Error('SUPPLY_PRIVATE_KEY is not defined');
            const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
            this.logger.log('Creating DEFENDR-R token...');
            const createTx = await new sdk_1.TokenCreateTransaction()
                .setTokenName('DEFENDR-R')
                .setTokenSymbol('DFR')
                .setTokenType(sdk_1.TokenType.FungibleCommon)
                .setDecimals(0)
                .setInitialSupply(1000000)
                .setTreasuryAccountId(treasuryId)
                .setSupplyType(sdk_1.TokenSupplyType.Infinite)
                .setSupplyKey(supplyKey)
                .setMaxTransactionFee(new sdk_1.Hbar(30))
                .freezeWith(this.client);
            const signedCreateTx = await createTx.sign(this.operatorKey);
            const createResponse = await signedCreateTx.execute(this.client);
            const createReceipt = await createResponse.getReceipt(this.client);
            const newTokenId = createReceipt.tokenId;
            fs.writeFileSync(tokenIdFile, newTokenId.toString());
            this.logger.log(`✅ Created DEFENDR-R token: ${newTokenId}`);
            let associated = false;
            try {
                this.logger.log(`Associating DEFENDR-R token with treasury account ${treasuryId}...`);
                const associateTx = await new sdk_1.TokenAssociateTransaction()
                    .setAccountId(treasuryId)
                    .setTokenIds([newTokenId])
                    .freezeWith(this.client);
                const signedAssociateTx = await associateTx.sign(this.operatorKey);
                const associateResponse = await signedAssociateTx.execute(this.client);
                await associateResponse.getReceipt(this.client);
                this.logger.log(`✅ Associated DEFENDR-R token with treasury account`);
                associated = true;
            }
            catch (associateError) {
                this.logger.warn(`Token association skipped (might already be associated): ${associateError.message}`);
                associated = true;
            }
            return {
                tokenId: newTokenId.toString(),
                transactionId: createResponse.transactionId.toString(),
                associated,
            };
        }
        catch (error) {
            this.logger.error(`Error creating DEFENDR-R token: ${error.message}`);
            throw new Error(`Failed to create DEFENDR-R token: ${error.message}`);
        }
    }
    async mintDefendrRTokens(amount) {
        try {
            const tokenIdFile = 'defendr-r.tokenid';
            if (!fs.existsSync(tokenIdFile)) {
                throw new Error('DEFENDR-R token does not exist. Create it first.');
            }
            const tokenId = sdk_1.TokenId.fromString(fs.readFileSync(tokenIdFile, 'utf8').trim());
            const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
            if (!supplyKeyString)
                throw new Error('SUPPLY_PRIVATE_KEY is not defined');
            const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
            this.logger.log(`Minting ${amount} DEFENDR-R tokens...`);
            const mintTx = await new sdk_1.TokenMintTransaction()
                .setTokenId(tokenId)
                .setAmount(amount)
                .setMaxTransactionFee(new sdk_1.Hbar(10))
                .freezeWith(this.client);
            const signedMintTx = await mintTx.sign(supplyKey);
            const mintResponse = await signedMintTx.execute(this.client);
            const mintReceipt = await mintResponse.getReceipt(this.client);
            this.logger.log(`✅ Minted ${amount} DEFENDR-R tokens`);
            return {
                status: mintReceipt.status.toString(),
                transactionId: mintResponse.transactionId.toString(),
                newTotalSupply: mintReceipt.totalSupply.toString(),
            };
        }
        catch (error) {
            this.logger.error(`Error minting DEFENDR-R tokens: ${error.message}`);
            throw new Error(`Failed to mint tokens: ${error.message}`);
        }
    }
    async sendDefendrRTokensToNewAccount(accountId, receiverPrivateKey, amount = 30) {
        try {
            const tokenIdFile = 'defendr-r.tokenid';
            if (!fs.existsSync(tokenIdFile)) {
                throw new Error('DEFENDR-R token does not exist. Create it first.');
            }
            const tokenId = sdk_1.TokenId.fromString(fs.readFileSync(tokenIdFile, 'utf8').trim());
            const receiverId = sdk_1.AccountId.fromString(accountId);
            const receiverKey = sdk_1.PrivateKey.fromString(receiverPrivateKey);
            const treasuryIdString = this.config.get('TREASURY_ACCOUNT_ID');
            if (!treasuryIdString)
                throw new Error('TREASURY_ACCOUNT_ID is not defined');
            const treasuryId = sdk_1.AccountId.fromString(treasuryIdString);
            const treasuryKeyString = this.config.get('OPERATOR_KEY');
            if (!treasuryKeyString)
                throw new Error('OPERATOR_KEY is not defined');
            const treasuryKey = sdk_1.PrivateKey.fromString(treasuryKeyString);
            this.logger.log(`🔗 Associating DEFENDR-R token with new account ${accountId}...`);
            const associateTx = await new sdk_1.TokenAssociateTransaction()
                .setAccountId(receiverId)
                .setTokenIds([tokenId])
                .setMaxTransactionFee(new sdk_1.Hbar(5))
                .freezeWith(this.client);
            const signedAssociateTx = await associateTx.sign(receiverKey);
            const associateResponse = await signedAssociateTx.execute(this.client);
            const associateReceipt = await associateResponse.getReceipt(this.client);
            this.logger.log(`✅ Token associated with account ${accountId}`);
            this.logger.log(`💸 Transferring ${amount} DEFENDR-R tokens to ${accountId}...`);
            const transferTx = await new sdk_1.TransferTransaction()
                .addTokenTransfer(tokenId, treasuryId, -amount)
                .addTokenTransfer(tokenId, receiverId, amount)
                .setMaxTransactionFee(new sdk_1.Hbar(5))
                .freezeWith(this.client);
            const signedTransferTx = await transferTx.sign(treasuryKey);
            const transferResponse = await signedTransferTx.execute(this.client);
            const transferReceipt = await transferResponse.getReceipt(this.client);
            this.logger.log(`✅ Transferred ${amount} DEFENDR-R tokens to ${accountId}`);
            return {
                success: true,
                associationTxId: associateResponse.transactionId.toString(),
                transferTxId: transferResponse.transactionId.toString(),
                message: `Successfully sent ${amount} DEFENDR-R tokens to ${accountId}`,
            };
        }
        catch (error) {
            this.logger.error(`❌ Error sending DEFENDR-R tokens: ${error.message}`);
            throw new Error(`Failed to send tokens: ${error.message}`);
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TokenService);
//# sourceMappingURL=token.service.js.map