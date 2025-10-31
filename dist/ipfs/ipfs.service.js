"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IpfsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
let IpfsService = IpfsService_1 = class IpfsService {
    constructor() {
        this.logger = new common_1.Logger(IpfsService_1.name);
    }
    async onModuleInit() {
        try {
            this.logger.log('Initialisation du service IPFS...');
            this.logger.log('Service IPFS simulé initialisé');
        }
        catch (error) {
            this.logger.error('Erreur lors de l\'initialisation d\'IPFS:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        this.logger.log('Service IPFS arrêté');
    }
    generateFakeCid() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'Qm';
        for (let i = 0; i < 44; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async uploadFile(file, filename) {
        try {
            this.logger.log(`Upload du fichier ${filename} vers IPFS (simulé)...`);
            await new Promise(resolve => setTimeout(resolve, 100));
            const cid = this.generateFakeCid();
            this.logger.log(`Fichier uploadé avec succès (simulé): ${cid}`);
            return {
                cid,
                size: file.length,
                path: filename
            };
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'upload du fichier ${filename}:`, error);
            throw new Error(`Échec de l'upload IPFS: ${error.message}`);
        }
    }
    async uploadMetadata(metadata) {
        try {
            this.logger.log('Upload des métadonnées vers IPFS (simulé)...');
            const metadataJson = JSON.stringify(metadata, null, 2);
            const metadataBytes = Buffer.from(metadataJson, 'utf8');
            await new Promise(resolve => setTimeout(resolve, 100));
            const cid = this.generateFakeCid();
            this.logger.log(`Métadonnées uploadées avec succès (simulé): ${cid}`);
            return {
                cid,
                size: metadataBytes.length,
                path: 'metadata.json'
            };
        }
        catch (error) {
            this.logger.error('Erreur lors de l\'upload des métadonnées:', error);
            throw new Error(`Échec de l'upload des métadonnées IPFS: ${error.message}`);
        }
    }
    async getFile(cid) {
        try {
            this.logger.log(`Récupération du fichier ${cid} depuis IPFS (simulé)...`);
            await new Promise(resolve => setTimeout(resolve, 100));
            const fileBuffer = Buffer.from('Contenu simulé du fichier IPFS', 'utf8');
            this.logger.log(`Fichier récupéré avec succès (simulé): ${fileBuffer.length} bytes`);
            return fileBuffer;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération du fichier ${cid}:`, error);
            throw new Error(`Échec de la récupération IPFS: ${error.message}`);
        }
    }
    async getMetadata(cid) {
        try {
            this.logger.log(`Récupération des métadonnées ${cid} depuis IPFS (simulé)...`);
            await new Promise(resolve => setTimeout(resolve, 100));
            const metadata = {
                name: 'NFT Simulé',
                description: 'Métadonnées simulées depuis IPFS',
                image: 'ipfs://QmSimulatedImageHash',
                attributes: { simulated: true },
                created_at: new Date().toISOString()
            };
            this.logger.log(`Métadonnées récupérées avec succès (simulé)`);
            return metadata;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération des métadonnées ${cid}:`, error);
            throw new Error(`Échec de la récupération des métadonnées IPFS: ${error.message}`);
        }
    }
    async uploadImageAndCreateMetadata(imageBuffer, filename, nftData) {
        try {
            this.logger.log(`Upload de l'image ${filename} et création des métadonnées...`);
            if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
                throw new Error('Image buffer invalide ou manquant');
            }
            const imageResult = await this.uploadFile(imageBuffer, filename);
            const metadata = {
                name: nftData.name,
                description: nftData.description || '',
                image: `ipfs://${imageResult.cid}`,
                attributes: nftData.attributes || {},
                created_at: new Date().toISOString()
            };
            const metadataResult = await this.uploadMetadata(metadata);
            this.logger.log(`Image et métadonnées uploadées avec succès`);
            this.logger.log(`Image CID: ${imageResult.cid}`);
            this.logger.log(`Métadonnées CID: ${metadataResult.cid}`);
            return {
                imageCid: imageResult.cid,
                metadataCid: metadataResult.cid,
                metadata
            };
        }
        catch (error) {
            this.logger.error('Erreur lors de l\'upload de l\'image et création des métadonnées:', error);
            throw new Error(`Échec de l'upload complet: ${error.message}`);
        }
    }
    async checkConnection() {
        try {
            await new Promise(resolve => setTimeout(resolve, 50));
            this.logger.log('Test de connectivité IPFS réussi (simulé)');
            return true;
        }
        catch (error) {
            this.logger.error('Test de connectivité IPFS échoué:', error);
            return false;
        }
    }
    getPublicUrl(cid, gateway = 'https://ipfs.io/ipfs/') {
        return `${gateway}${cid}`;
    }
    getIpfsUrl(cid) {
        return `ipfs://${cid}`;
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = IpfsService_1 = __decorate([
    (0, common_1.Injectable)()
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map