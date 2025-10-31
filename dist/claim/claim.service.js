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
var ClaimService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
const nft_service_1 = require("../nft/nft.service");
const token_service_1 = require("../token/token.service");
const fs = require("fs");
let ClaimService = ClaimService_1 = class ClaimService {
    constructor(config, nftService, tokenService) {
        this.config = config;
        this.nftService = nftService;
        this.tokenService = tokenService;
        this.logger = new common_1.Logger(ClaimService_1.name);
        this.tokenIdFile = 'defendr-r.tokenid';
        const network = this.config.get('HEDERA_NETWORK') || 'testnet';
        const operatorId = sdk_1.AccountId.fromString(this.config.get('OPERATOR_ID'));
        const operatorKeyString = this.config.get('OPERATOR_KEY');
        this.operatorKey = sdk_1.PrivateKey.fromString(operatorKeyString);
        this.client = network === 'mainnet' ? sdk_1.Client.forMainnet() : sdk_1.Client.forTestnet();
        this.client.setOperator(operatorId, this.operatorKey);
        this.loadRedTokenId();
    }
    loadRedTokenId() {
        if (fs.existsSync(this.tokenIdFile)) {
            this.redTokenId = fs.readFileSync(this.tokenIdFile, 'utf8').trim();
            this.logger.log(`DEFENDR-R Token ID: ${this.redTokenId}`);
        }
        else {
            this.logger.warn('DEFENDR-R token ID file not found');
        }
    }
    getRedTokenId() {
        if (!this.redTokenId) {
            this.loadRedTokenId();
        }
        return this.redTokenId;
    }
    async isTokenAssociated(accountId, tokenId) {
        try {
            const account = sdk_1.AccountId.fromString(accountId);
            const token = sdk_1.TokenId.fromString(tokenId);
            const balanceQuery = new sdk_1.AccountBalanceQuery()
                .setAccountId(account);
            const balance = await balanceQuery.execute(this.client);
            const tokenBalance = balance.tokens.get(token);
            return tokenBalance !== null && tokenBalance !== undefined;
        }
        catch (error) {
            this.logger.error(`Error checking token association: ${error.message}`);
            return false;
        }
    }
    async autoAssociateTokenForUser(accountId, accountPrivateKey, tokenId) {
        try {
            this.logger.log(`Auto-associating token ${tokenId} with account ${accountId}...`);
            const account = sdk_1.AccountId.fromString(accountId);
            const token = sdk_1.TokenId.fromString(tokenId);
            const privateKey = sdk_1.PrivateKey.fromString(accountPrivateKey);
            const associateTx = await new sdk_1.TokenAssociateTransaction()
                .setAccountId(account)
                .setTokenIds([token])
                .freezeWith(this.client);
            const signedTx = await associateTx.sign(privateKey);
            const response = await signedTx.execute(this.client);
            await response.getReceipt(this.client);
            this.logger.log(`✅ Auto-associated token ${tokenId} with account ${accountId}`);
            return true;
        }
        catch (error) {
            this.logger.warn(`Failed to auto-associate token: ${error.message}`);
            return false;
        }
    }
    async transferRedTokens(toAccountId, amount, userPrivateKey) {
        try {
            if (!this.redTokenId) {
                throw new Error('DEFENDR-R token ID not found');
            }
            const tokenId = sdk_1.TokenId.fromString(this.redTokenId);
            const treasuryId = sdk_1.AccountId.fromString(this.config.get('TREASURY_ACCOUNT_ID'));
            const toAccount = sdk_1.AccountId.fromString(toAccountId);
            let isAssociated = await this.isTokenAssociated(toAccountId, this.redTokenId);
            let autoAssociated = false;
            if (!isAssociated && userPrivateKey) {
                this.logger.log(`🔄 Token not associated, attempting auto-association...`);
                autoAssociated = await this.autoAssociateTokenForUser(toAccountId, userPrivateKey, this.redTokenId);
                if (autoAssociated) {
                    isAssociated = true;
                    this.logger.log('✅ Auto-association successful!');
                }
            }
            if (!isAssociated) {
                this.logger.error(`Token ${this.redTokenId} is NOT associated with account ${toAccountId}`);
                throw new Error(`❌ Token ${this.redTokenId} is NOT associated with account ${toAccountId}.\n\n` +
                    `💡 TIP: Pass the user's privateKey in the claim request to enable automatic association!`);
            }
            const tx = await new sdk_1.TransferTransaction()
                .addTokenTransfer(tokenId, treasuryId, -amount)
                .addTokenTransfer(tokenId, toAccount, amount)
                .freezeWith(this.client);
            const signedTx = await tx.sign(this.operatorKey);
            const response = await signedTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`✅ Transferred ${amount} DEFENDR-R tokens to ${toAccountId}`);
            return {
                status: receipt.status.toString(),
                transactionId: response.transactionId.toString(),
                autoAssociated,
            };
        }
        catch (error) {
            this.logger.error(`Error transferring tokens: ${error.message}`);
            throw new Error(`Token transfer failed: ${error.message}`);
        }
    }
    async claimNftWithMission(request) {
        var _a, _b, _c;
        try {
            if (!((_a = request.user) === null || _a === void 0 ? void 0 : _a.accountId)) {
                throw new Error('User account ID is required');
            }
            if (!((_b = request.mission) === null || _b === void 0 ? void 0 : _b.id) || !((_c = request.mission) === null || _c === void 0 ? void 0 : _c.name)) {
                throw new Error('Mission ID and name are required');
            }
            if (request.tokenAmount <= 0) {
                throw new Error('Token amount must be greater than 0');
            }
            this.logger.log(`Minting NFT for mission: ${request.mission.name}`);
            const nftMetadata = {
                name: `Mission: ${request.mission.name}`,
                description: request.mission.description || 'Mission completed',
                image: request.mission.imageUrl || '',
                attributes: {
                    missionId: request.mission.id,
                    missionName: request.mission.name,
                    difficulty: request.mission.difficulty || 'medium',
                    reward: request.mission.reward || request.tokenAmount,
                    completedBy: request.user.name || request.user.accountId,
                    completedAt: new Date().toISOString(),
                    userAccountId: request.user.accountId,
                },
            };
            const nftResult = await this.nftService.mintNft(nftMetadata);
            this.logger.log(`Transferring NFT ${nftResult.nftId} to ${request.user.accountId}`);
            try {
                await this.nftService.transferNft({
                    tokenId: nftResult.tokenId,
                    serialNumber: nftResult.serialNumber,
                    fromAccountId: this.config.get('TREASURY_ACCOUNT_ID'),
                    toAccountId: request.user.accountId,
                    fromPrivateKey: this.config.get('OPERATOR_KEY'),
                    toPrivateKey: request.user.privateKey,
                });
                this.logger.log(`✅ NFT transferred to user ${request.user.accountId}`);
            }
            catch (nftTransferError) {
                this.logger.warn(`NFT transfer failed (NFT still in treasury): ${nftTransferError.message}`);
            }
            this.logger.log(`Transferring ${request.tokenAmount} DEFENDR-R tokens to ${request.user.accountId}`);
            const tokenTransferResult = await this.transferRedTokens(request.user.accountId, request.tokenAmount, request.user.privateKey);
            const response = {
                success: true,
                nft: {
                    nftId: nftResult.nftId,
                    tokenId: nftResult.tokenId,
                    serialNumber: nftResult.serialNumber,
                    transactionId: nftResult.transactionId,
                },
                tokenTransfer: {
                    tokenId: this.redTokenId,
                    amount: request.tokenAmount,
                    transactionId: tokenTransferResult.transactionId,
                    autoAssociated: tokenTransferResult.autoAssociated,
                },
                message: tokenTransferResult.autoAssociated
                    ? `✅ NFT claimed! Token auto-associated and ${request.tokenAmount} DEFENDR-R tokens transferred`
                    : `✅ NFT claimed and ${request.tokenAmount} DEFENDR-R tokens transferred`,
            };
            this.logger.log(`Claim successful for user ${request.user.accountId}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Error during claim: ${error.message}`);
            throw new Error(`Claim failed: ${error.message}`);
        }
    }
};
exports.ClaimService = ClaimService;
exports.ClaimService = ClaimService = ClaimService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nft_service_1.NftService,
        token_service_1.TokenService])
], ClaimService);
//# sourceMappingURL=claim.service.js.map