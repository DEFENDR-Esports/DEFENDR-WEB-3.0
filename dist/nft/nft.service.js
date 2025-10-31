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
var NftService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ipfs_service_1 = require("../ipfs/ipfs.service");
const nft_metadata_service_1 = require("./nft-metadata.service");
const sdk_1 = require("@hashgraph/sdk");
const fs = require("fs");
let NftService = NftService_1 = class NftService {
    constructor(config, ipfsService, nftMetadataService) {
        this.config = config;
        this.ipfsService = ipfsService;
        this.nftMetadataService = nftMetadataService;
        this.logger = new common_1.Logger(NftService_1.name);
        this.tokenIdFile = 'defendr-nft.tokenid';
        const network = this.config.get('HEDERA_NETWORK') || 'testnet';
        const operatorId = sdk_1.AccountId.fromString(this.config.get('OPERATOR_ID'));
        const operatorKeyString = this.config.get('OPERATOR_KEY');
        this.operatorKey = sdk_1.PrivateKey.fromString(operatorKeyString);
        this.client = network === 'mainnet' ? sdk_1.Client.forMainnet() : sdk_1.Client.forTestnet();
        this.client.setOperator(operatorId, this.operatorKey);
    }
    async onModuleInit() {
        this.tokenId = await this.createNftTokenIfNotExists();
        this.logger.log(`DEFENDR-NFT Token ID: ${this.tokenId}`);
    }
    async createNftTokenIfNotExists() {
        if (fs.existsSync(this.tokenIdFile)) {
            const existingTokenId = fs.readFileSync(this.tokenIdFile, 'utf8');
            this.logger.log(`NFT Token already exists with ID: ${existingTokenId}`);
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
        const { TokenCreateTransaction, TokenType, TokenSupplyType } = await Promise.resolve().then(() => require('@hashgraph/sdk'));
        const tx = await new TokenCreateTransaction()
            .setTokenName('DEFENDR-NFT')
            .setTokenSymbol('DFNFT')
            .setTokenType(TokenType.NonFungibleUnique)
            .setTreasuryAccountId(treasuryId)
            .setSupplyType(TokenSupplyType.Infinite)
            .setSupplyKey(supplyKey)
            .setMaxTransactionFee(new sdk_1.Hbar(10))
            .freezeWith(this.client);
        const signedTx = await tx.sign(this.operatorKey);
        const response = await signedTx.execute(this.client);
        const receipt = await response.getReceipt(this.client);
        const tokenId = receipt.tokenId;
        fs.writeFileSync(this.tokenIdFile, tokenId.toString());
        this.logger.log(`Created DEFENDR-NFT token with ID: ${tokenId}`);
        return tokenId.toString();
    }
    async mintNft(request) {
        try {
            const tokenId = sdk_1.TokenId.fromString(this.tokenId);
            const metadata = {
                name: request.name,
                description: request.description || '',
                image: request.image || '',
                attributes: request.attributes || {},
                created_at: new Date().toISOString()
            };
            const ipfsResult = await this.ipfsService.uploadMetadata(metadata);
            this.logger.log(`Métadonnées uploadées vers IPFS: ${ipfsResult.cid}`);
            const metadataBytes = Buffer.from(ipfsResult.cid, 'utf8');
            const tx = await new sdk_1.TokenMintTransaction()
                .setTokenId(tokenId)
                .addMetadata(metadataBytes)
                .setMaxTransactionFee(new sdk_1.Hbar(10))
                .freezeWith(this.client);
            const signedTx = await tx.sign(this.operatorKey);
            const response = await signedTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const nftId = receipt.serials[0];
            const nftIdString = `${tokenId.toString()}/${nftId}`;
            this.logger.log(`Minted NFT: ${nftIdString} with name: ${request.name}`);
            this.logger.log(`IPFS CID: ${ipfsResult.cid}`);
            return {
                nftId: nftIdString,
                tokenId: tokenId.toString(),
                serialNumber: nftId.toNumber(),
                transactionId: response.transactionId.toString(),
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors du minting NFT: ${error.message}`);
            throw new Error(`Échec du minting NFT: ${error.message}`);
        }
    }
    async mintNftWithImage(imageBuffer, filename, nftData) {
        try {
            const tokenId = sdk_1.TokenId.fromString(this.tokenId);
            const ipfsResult = await this.ipfsService.uploadImageAndCreateMetadata(imageBuffer, filename, nftData);
            this.logger.log(`Image uploadée vers IPFS: ${ipfsResult.imageCid}`);
            this.logger.log(`Métadonnées uploadées vers IPFS: ${ipfsResult.metadataCid}`);
            const metadataBytes = Buffer.from(ipfsResult.metadataCid, 'utf8');
            const tx = await new sdk_1.TokenMintTransaction()
                .setTokenId(tokenId)
                .addMetadata(metadataBytes)
                .setMaxTransactionFee(new sdk_1.Hbar(10))
                .freezeWith(this.client);
            const signedTx = await tx.sign(this.operatorKey);
            const response = await signedTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const nftId = receipt.serials[0];
            const nftIdString = `${tokenId.toString()}/${nftId}`;
            this.logger.log(`Minted NFT avec image: ${nftIdString}`);
            this.logger.log(`Image IPFS: ipfs://${ipfsResult.imageCid}`);
            this.logger.log(`Métadonnées IPFS: ipfs://${ipfsResult.metadataCid}`);
            await this.nftMetadataService.storeNftMetadata(nftIdString, ipfsResult.imageCid, ipfsResult.metadataCid, ipfsResult.metadata);
            return {
                nftId: nftIdString,
                tokenId: tokenId.toString(),
                serialNumber: nftId.toNumber(),
                transactionId: response.transactionId.toString(),
                imageCid: ipfsResult.imageCid,
                metadataCid: ipfsResult.metadataCid
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors du minting NFT avec image: ${error.message}`);
            throw new Error(`Échec du minting NFT avec image: ${error.message}`);
        }
    }
    async getNftInfo(nftId) {
        try {
            const [tokenIdStr, serialNumberStr] = nftId.split('/');
            const tokenId = sdk_1.TokenId.fromString(tokenIdStr);
            const serialNumber = parseInt(serialNumberStr);
            return {
                nftId,
                tokenId: tokenId.toString(),
                serialNumber,
                status: 'minted'
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des infos NFT: ${error.message}`);
            throw new Error(`Échec de la récupération des infos NFT: ${error.message}`);
        }
    }
    async getNftMetadata(nftId) {
        try {
            const storedMetadata = await this.nftMetadataService.getNftMetadata(nftId);
            if (!storedMetadata) {
                throw new Error(`Métadonnées non trouvées pour NFT: ${nftId}`);
            }
            return {
                nftId: storedMetadata.nftId,
                imageCid: storedMetadata.imageCid,
                metadataCid: storedMetadata.metadataCid,
                metadata: storedMetadata.metadata,
                createdAt: storedMetadata.createdAt,
                imageUrl: `ipfs://${storedMetadata.imageCid}`,
                imagePublicUrl: `https://ipfs.io/ipfs/${storedMetadata.imageCid}`,
                metadataUrl: `ipfs://${storedMetadata.metadataCid}`,
                metadataPublicUrl: `https://ipfs.io/ipfs/${storedMetadata.metadataCid}`
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des métadonnées NFT: ${error.message}`);
            throw new Error(`Échec de la récupération des métadonnées NFT: ${error.message}`);
        }
    }
    async createAccount(request) {
        try {
            const initialBalance = new sdk_1.Hbar(request.initialBalance || 0);
            const maxAssociations = request.maxTokenAssociations || 100;
            const newPrivateKey = sdk_1.PrivateKey.generateED25519();
            const newPublicKey = newPrivateKey.publicKey;
            const response = await new sdk_1.AccountCreateTransaction()
                .setInitialBalance(initialBalance)
                .setKey(newPublicKey)
                .setMaxAutomaticTokenAssociations(maxAssociations)
                .execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const accountId = receipt.accountId;
            this.logger.log(`✅ Account created: ${accountId} with auto-association enabled (max ${maxAssociations} tokens)`);
            return {
                accountId: accountId.toString(),
                privateKey: newPrivateKey.toString(),
                publicKey: newPublicKey.toString(),
                status: receipt.status.toString()
            };
        }
        catch (error) {
            this.logger.error(`Error creating account: ${error.message}`);
            throw new Error(`Failed to create account: ${error.message}`);
        }
    }
    async createNftTokenWithCustomFees(tokenName, tokenSymbol, maxSupply, customFeeAmount) {
        try {
            const treasuryIdString = this.config.get('TREASURY_ACCOUNT_ID');
            if (!treasuryIdString)
                throw new Error('TREASURY_ACCOUNT_ID is not defined');
            const treasuryId = sdk_1.AccountId.fromString(treasuryIdString);
            const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
            if (!supplyKeyString)
                throw new Error('SUPPLY_PRIVATE_KEY is not defined');
            const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
            const adminKeyString = this.config.get('ADMIN_PRIVATE_KEY');
            if (!adminKeyString)
                throw new Error('ADMIN_PRIVATE_KEY is not defined');
            const adminKey = sdk_1.PrivateKey.fromString(adminKeyString);
            const pauseKeyString = this.config.get('PAUSE_PRIVATE_KEY');
            const pauseKey = pauseKeyString ? sdk_1.PrivateKey.fromString(pauseKeyString) : undefined;
            const freezeKeyString = this.config.get('FREEZE_PRIVATE_KEY');
            const freezeKey = freezeKeyString ? sdk_1.PrivateKey.fromString(freezeKeyString) : undefined;
            const wipeKeyString = this.config.get('WIPE_PRIVATE_KEY');
            const wipeKey = wipeKeyString ? sdk_1.PrivateKey.fromString(wipeKeyString) : undefined;
            const nftCustomFee = new sdk_1.CustomFixedFee()
                .setFeeCollectorAccountId(treasuryId)
                .setAmount(customFeeAmount);
            const tx = new sdk_1.TokenCreateTransaction()
                .setTokenName(tokenName)
                .setTokenSymbol(tokenSymbol)
                .setTokenType(sdk_1.TokenType.NonFungibleUnique)
                .setDecimals(0)
                .setInitialSupply(0)
                .setTreasuryAccountId(treasuryId)
                .setSupplyType(sdk_1.TokenSupplyType.Finite)
                .setMaxSupply(maxSupply)
                .setCustomFees([nftCustomFee])
                .setAdminKey(adminKey.publicKey)
                .setSupplyKey(supplyKey.publicKey)
                .setPauseKey(pauseKey === null || pauseKey === void 0 ? void 0 : pauseKey.publicKey)
                .setFreezeKey(freezeKey === null || freezeKey === void 0 ? void 0 : freezeKey.publicKey)
                .setWipeKey(wipeKey === null || wipeKey === void 0 ? void 0 : wipeKey.publicKey)
                .freezeWith(this.client);
            const signedTx = await tx.sign(sdk_1.PrivateKey.fromString(this.config.get('TREASURY_PRIVATE_KEY')));
            const finalTx = await signedTx.sign(adminKey);
            const response = await finalTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const tokenId = receipt.tokenId;
            this.logger.log(`Token NFT créé avec ID: ${tokenId}`);
            return tokenId.toString();
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création du token NFT: ${error.message}`);
            throw new Error(`Échec de la création du token NFT: ${error.message}`);
        }
    }
    async mintNftBatch(tokenId, cids) {
        try {
            const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
            if (!supplyKeyString)
                throw new Error('SUPPLY_PRIVATE_KEY is not defined');
            const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
            const tokenIdObj = sdk_1.TokenId.fromString(tokenId);
            const metadataBytes = cids.map(cid => Buffer.from(cid, 'utf8'));
            const tx = await new sdk_1.TokenMintTransaction()
                .setTokenId(tokenIdObj)
                .setMetadata(metadataBytes)
                .freezeWith(this.client);
            const signedTx = await tx.sign(supplyKey);
            const response = await signedTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            return {
                status: receipt.status.toString(),
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors du minting batch: ${error.message}`);
            throw new Error(`Échec du minting batch: ${error.message}`);
        }
    }
    async burnNft(tokenId, serialNumber) {
        try {
            const supplyKeyString = this.config.get('SUPPLY_PRIVATE_KEY');
            if (!supplyKeyString)
                throw new Error('SUPPLY_PRIVATE_KEY is not defined');
            const supplyKey = sdk_1.PrivateKey.fromString(supplyKeyString);
            const tokenIdObj = sdk_1.TokenId.fromString(tokenId);
            const tx = await new sdk_1.TokenBurnTransaction()
                .setTokenId(tokenIdObj)
                .setSerials([serialNumber])
                .freezeWith(this.client)
                .sign(supplyKey);
            const response = await tx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`NFT brûlé: ${tokenId}/${serialNumber}`);
            return {
                status: receipt.status.toString(),
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors du burn: ${error.message}`);
            throw new Error(`Échec du burn: ${error.message}`);
        }
    }
    async enableAutoAssociation(accountId, privateKey, maxAssociations = 10) {
        try {
            const accountIdObj = sdk_1.AccountId.fromString(accountId);
            const accountKey = sdk_1.PrivateKey.fromString(privateKey);
            const tx = await new sdk_1.AccountUpdateTransaction()
                .setAccountId(accountIdObj)
                .setMaxAutomaticTokenAssociations(maxAssociations)
                .freezeWith(this.client)
                .sign(accountKey);
            const response = await tx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`Auto-association activée pour ${accountId}`);
            return {
                status: receipt.status.toString(),
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'auto-association: ${error.message}`);
            throw new Error(`Échec de l'auto-association: ${error.message}`);
        }
    }
    async associateToken(accountId, tokenId, privateKey) {
        try {
            const accountIdObj = sdk_1.AccountId.fromString(accountId);
            const tokenIdObj = sdk_1.TokenId.fromString(tokenId);
            const accountKey = sdk_1.PrivateKey.fromString(privateKey);
            const tx = await new sdk_1.TokenAssociateTransaction()
                .setAccountId(accountIdObj)
                .setTokenIds([tokenIdObj])
                .freezeWith(this.client)
                .sign(accountKey);
            const response = await tx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`Token ${tokenId} associé au compte ${accountId}`);
            return {
                status: receipt.status.toString(),
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'association: ${error.message}`);
            throw new Error(`Échec de l'association: ${error.message}`);
        }
    }
    async getAccountBalance(accountId, tokenId) {
        try {
            const accountIdObj = sdk_1.AccountId.fromString(accountId);
            const balanceQuery = await new sdk_1.AccountBalanceQuery()
                .setAccountId(accountIdObj)
                .execute(this.client);
            let nftCount = 0;
            if (tokenId) {
                const tokenBalance = balanceQuery.tokens._map.get(tokenId);
                nftCount = tokenBalance ? tokenBalance.toNumber() : 0;
            }
            return {
                nftCount,
                hbarBalance: balanceQuery.hbars.toString(),
                tokenId
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la vérification du solde: ${error.message}`);
            throw new Error(`Échec de la vérification du solde: ${error.message}`);
        }
    }
    async transferNft(request) {
        try {
            const tokenId = sdk_1.TokenId.fromString(request.tokenId);
            const fromAccountId = sdk_1.AccountId.fromString(request.fromAccountId);
            const toAccountId = sdk_1.AccountId.fromString(request.toAccountId);
            const fromKey = sdk_1.PrivateKey.fromString(request.fromPrivateKey);
            let tx = new sdk_1.TransferTransaction()
                .addNftTransfer(tokenId, request.serialNumber, fromAccountId, toAccountId);
            if (request.price) {
                const price = new sdk_1.Hbar(request.price);
                tx = tx
                    .addHbarTransfer(fromAccountId, price)
                    .addHbarTransfer(toAccountId, price.negated());
            }
            tx = await tx.freezeWith(this.client).sign(fromKey);
            if (request.toPrivateKey) {
                const toKey = sdk_1.PrivateKey.fromString(request.toPrivateKey);
                tx = await tx.sign(toKey);
            }
            const response = await tx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`NFT transféré: ${request.tokenId}/${request.serialNumber} de ${request.fromAccountId} vers ${request.toAccountId}`);
            return {
                status: receipt.status.toString(),
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors du transfert: ${error.message}`);
            throw new Error(`Échec du transfert: ${error.message}`);
        }
    }
    async getTokenInfo(tokenId) {
        var _a, _b, _c, _d, _e;
        try {
            const tokenIdObj = sdk_1.TokenId.fromString(tokenId);
            const tokenInfo = await new sdk_1.TokenInfoQuery()
                .setTokenId(tokenIdObj)
                .execute(this.client);
            return {
                tokenId: tokenInfo.tokenId.toString(),
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                decimals: tokenInfo.decimals,
                totalSupply: tokenInfo.totalSupply,
                maxSupply: tokenInfo.maxSupply,
                treasury: tokenInfo.treasuryAccountId.toString(),
                customFees: tokenInfo.customFees,
                adminKey: (_a = tokenInfo.adminKey) === null || _a === void 0 ? void 0 : _a.toString(),
                supplyKey: (_b = tokenInfo.supplyKey) === null || _b === void 0 ? void 0 : _b.toString(),
                freezeKey: (_c = tokenInfo.freezeKey) === null || _c === void 0 ? void 0 : _c.toString(),
                pauseKey: (_d = tokenInfo.pauseKey) === null || _d === void 0 ? void 0 : _d.toString(),
                wipeKey: (_e = tokenInfo.wipeKey) === null || _e === void 0 ? void 0 : _e.toString()
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des infos token: ${error.message}`);
            throw new Error(`Échec de la récupération des infos token: ${error.message}`);
        }
    }
};
exports.NftService = NftService;
exports.NftService = NftService = NftService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        ipfs_service_1.IpfsService,
        nft_metadata_service_1.NftMetadataService])
], NftService);
//# sourceMappingURL=nft.service.js.map