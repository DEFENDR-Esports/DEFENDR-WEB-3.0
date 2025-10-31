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
var NftMetadataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftMetadataService = void 0;
const common_1 = require("@nestjs/common");
const ipfs_service_1 = require("../ipfs/ipfs.service");
let NftMetadataService = NftMetadataService_1 = class NftMetadataService {
    constructor(ipfsService) {
        this.ipfsService = ipfsService;
        this.logger = new common_1.Logger(NftMetadataService_1.name);
        this.metadataStore = new Map();
    }
    async storeNftMetadata(nftId, imageCid, metadataCid, metadata) {
        try {
            const storedMetadata = {
                nftId,
                imageCid,
                metadataCid,
                metadata,
                createdAt: new Date().toISOString()
            };
            this.metadataStore.set(nftId, storedMetadata);
            this.logger.log(`Métadonnées stockées pour NFT: ${nftId}`);
        }
        catch (error) {
            this.logger.error(`Erreur lors du stockage des métadonnées: ${error.message}`);
            throw error;
        }
    }
    async getNftMetadata(nftId) {
        try {
            const storedMetadata = this.metadataStore.get(nftId);
            if (!storedMetadata) {
                this.logger.warn(`Métadonnées non trouvées pour NFT: ${nftId}`);
                return null;
            }
            const ipfsMetadata = await this.ipfsService.getMetadata(storedMetadata.metadataCid);
            return Object.assign(Object.assign({}, storedMetadata), { metadata: ipfsMetadata });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des métadonnées: ${error.message}`);
            throw error;
        }
    }
    async getAllStoredMetadata() {
        try {
            const allMetadata = Array.from(this.metadataStore.values());
            this.logger.log(`Récupération de ${allMetadata.length} métadonnées stockées`);
            return allMetadata;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération de toutes les métadonnées: ${error.message}`);
            throw error;
        }
    }
    async deleteNftMetadata(nftId) {
        try {
            const deleted = this.metadataStore.delete(nftId);
            this.logger.log(`Métadonnées supprimées pour NFT: ${nftId}`);
            return deleted;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression des métadonnées: ${error.message}`);
            throw error;
        }
    }
    getStats() {
        return {
            totalStored: this.metadataStore.size,
            nftIds: Array.from(this.metadataStore.keys())
        };
    }
};
exports.NftMetadataService = NftMetadataService;
exports.NftMetadataService = NftMetadataService = NftMetadataService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ipfs_service_1.IpfsService])
], NftMetadataService);
//# sourceMappingURL=nft-metadata.service.js.map