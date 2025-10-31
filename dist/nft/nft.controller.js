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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NftController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const nft_service_1 = require("./nft.service");
const nft_metadata_service_1 = require("./nft-metadata.service");
const ipfs_service_1 = require("../ipfs/ipfs.service");
let NftController = NftController_1 = class NftController {
    constructor(nftService, nftMetadataService, ipfsService) {
        this.nftService = nftService;
        this.nftMetadataService = nftMetadataService;
        this.ipfsService = ipfsService;
        this.logger = new common_1.Logger(NftController_1.name);
    }
    async mintNft(request) {
        try {
            if (!request.name || request.name.trim().length === 0) {
                throw new common_1.HttpException('Le nom du NFT est requis', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.nftService.mintNft(request);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors du minting du NFT', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNftInfo(nftId) {
        try {
            if (!nftId || !nftId.includes('/')) {
                throw new common_1.HttpException('Format NFT ID invalide', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.nftService.getNftInfo(nftId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la récupération des infos NFT', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async healthCheck() {
        return {
            status: 'ok',
            message: 'Service NFT opérationnel'
        };
    }
    async createAccount(request) {
        try {
            return await this.nftService.createAccount(request);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la création du compte', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createNftToken(body) {
        try {
            const tokenId = await this.nftService.createNftTokenWithCustomFees(body.tokenName, body.tokenSymbol, body.maxSupply, body.customFeeAmount);
            return { tokenId };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la création du token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async mintNftBatch(body) {
        try {
            return await this.nftService.mintNftBatch(body.tokenId, body.cids);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors du minting batch', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async burnNft(body) {
        try {
            return await this.nftService.burnNft(body.tokenId, body.serialNumber);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors du burn', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async enableAutoAssociation(body) {
        try {
            return await this.nftService.enableAutoAssociation(body.accountId, body.privateKey, body.maxAssociations || 10);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de l\'auto-association', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async associateToken(body) {
        try {
            return await this.nftService.associateToken(body.accountId, body.tokenId, body.privateKey);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de l\'association', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAccountBalance(accountId, tokenId) {
        try {
            return await this.nftService.getAccountBalance(accountId, tokenId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la vérification du solde', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async transferNft(request) {
        try {
            return await this.nftService.transferNft(request);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors du transfert', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTokenInfo(tokenId) {
        try {
            return await this.nftService.getTokenInfo(tokenId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la récupération des infos token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async mintNftWithImage(file, body) {
        try {
            if (!file) {
                throw new common_1.HttpException('Aucun fichier image fourni', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!file.buffer) {
                throw new common_1.HttpException('Buffer du fichier manquant', common_1.HttpStatus.BAD_REQUEST);
            }
            let attributes = {};
            if (body.attributes) {
                try {
                    attributes = JSON.parse(body.attributes);
                }
                catch (error) {
                    this.logger.warn('Erreur lors du parsing des attributs JSON:', error);
                }
            }
            const result = await this.nftService.mintNftWithImage(file.buffer, file.originalname, {
                name: body.name,
                description: body.description,
                attributes
            });
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors du minting avec image IPFS', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadToIpfs(file) {
        try {
            if (!file) {
                throw new common_1.HttpException('Aucun fichier fourni', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.ipfsService.uploadFile(file.buffer, file.originalname);
            return {
                cid: result.cid,
                size: Number(result.size),
                path: result.path,
                ipfsUrl: `ipfs://${result.cid}`,
                publicUrl: `https://ipfs.io/ipfs/${result.cid}`
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de l\'upload IPFS', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkIpfsHealth() {
        try {
            const connected = await this.ipfsService.checkConnection();
            return {
                status: connected ? 'ok' : 'error',
                connected
            };
        }
        catch (error) {
            return {
                status: 'error',
                connected: false
            };
        }
    }
    async getNftMetadata(nftId) {
        try {
            if (!nftId || !nftId.includes('/')) {
                throw new common_1.HttpException('Format NFT ID invalide', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.nftService.getNftMetadata(nftId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la récupération des métadonnées', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getIpfsMetadata(cid) {
        try {
            const metadata = await this.ipfsService.getMetadata(cid);
            return {
                cid,
                metadata,
                ipfsUrl: `ipfs://${cid}`,
                publicUrl: `https://ipfs.io/ipfs/${cid}`
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la récupération des métadonnées IPFS', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllStoredMetadata() {
        try {
            const allMetadata = await this.nftMetadataService.getAllStoredMetadata();
            return {
                total: allMetadata.length,
                nfts: allMetadata
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la récupération de toutes les métadonnées', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMetadataStats() {
        try {
            const stats = this.nftMetadataService.getStats();
            return stats;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Erreur lors de la récupération des statistiques', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.NftController = NftController;
__decorate([
    (0, common_1.Post)('mint'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "mintNft", null);
__decorate([
    (0, common_1.Get)('info/:nftId'),
    __param(0, (0, common_1.Param)('nftId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getNftInfo", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NftController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('account/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Post)('token/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "createNftToken", null);
__decorate([
    (0, common_1.Post)('mint/batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "mintNftBatch", null);
__decorate([
    (0, common_1.Post)('burn'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "burnNft", null);
__decorate([
    (0, common_1.Post)('account/auto-associate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "enableAutoAssociation", null);
__decorate([
    (0, common_1.Post)('account/associate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "associateToken", null);
__decorate([
    (0, common_1.Get)('balance/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "transferNft", null);
__decorate([
    (0, common_1.Get)('token/info/:tokenId'),
    __param(0, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getTokenInfo", null);
__decorate([
    (0, common_1.Post)('mint/with-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Format de fichier non supporté'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "mintNftWithImage", null);
__decorate([
    (0, common_1.Post)('upload/ipfs'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|txt)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Format de fichier non supporté'), false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "uploadToIpfs", null);
__decorate([
    (0, common_1.Get)('ipfs/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NftController.prototype, "checkIpfsHealth", null);
__decorate([
    (0, common_1.Get)('metadata/:nftId'),
    __param(0, (0, common_1.Param)('nftId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getNftMetadata", null);
__decorate([
    (0, common_1.Get)('ipfs/metadata/:cid'),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getIpfsMetadata", null);
__decorate([
    (0, common_1.Get)('metadata/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getAllStoredMetadata", null);
__decorate([
    (0, common_1.Get)('metadata/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NftController.prototype, "getMetadataStats", null);
exports.NftController = NftController = NftController_1 = __decorate([
    (0, common_1.Controller)('nft'),
    __metadata("design:paramtypes", [nft_service_1.NftService,
        nft_metadata_service_1.NftMetadataService,
        ipfs_service_1.IpfsService])
], NftController);
//# sourceMappingURL=nft.controller.js.map