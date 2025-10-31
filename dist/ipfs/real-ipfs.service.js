"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var RealIpfsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealIpfsService = void 0;
const common_1 = require("@nestjs/common");
const ipfs_http_client_1 = require("ipfs-http-client");
let RealIpfsService = RealIpfsService_1 = class RealIpfsService {
    constructor() {
        this.logger = new common_1.Logger(RealIpfsService_1.name);
        this.isConnected = false;
    }
    async onModuleInit() {
        try {
            this.ipfs = (0, ipfs_http_client_1.create)({ url: 'http://localhost:5001/api/v0' });
            const id = await this.ipfs.id();
            this.isConnected = true;
            this.logger.log(`✅ Connecté à IPFS - ID: ${id.id}`);
        }
        catch (error) {
            this.logger.warn(`⚠️  Nœud IPFS local non disponible: ${error.message}`);
            this.logger.log('💡 Pour utiliser de vraies images IPFS:');
            this.logger.log('   1. Installez IPFS: https://ipfs.io/docs/install/');
            this.logger.log('   2. Lancez: ipfs daemon');
            this.logger.log('   3. Redémarrez l\'application');
            await this.initPublicService();
        }
    }
    async onModuleDestroy() {
        if (this.ipfs && this.isConnected) {
            this.logger.log('Déconnexion d\'IPFS...');
        }
    }
    async initPublicService() {
        try {
            this.logger.log('🔄 Tentative de connexion à un service IPFS public...');
            this.logger.warn('⚠️  Mode simulé activé - images factices');
            this.isConnected = false;
        }
        catch (error) {
            this.logger.error(`❌ Impossible de se connecter à IPFS: ${error.message}`);
            this.isConnected = false;
        }
    }
    async uploadFile(buffer, filename) {
        if (!this.isConnected) {
            return this.generateFakeResult(buffer, filename);
        }
        try {
            this.logger.log(`📤 Upload de ${filename} vers IPFS...`);
            const result = await this.ipfs.add(buffer, {
                pin: true,
                progress: (prog) => {
                    this.logger.log(`Upload progress: ${prog}%`);
                }
            });
            this.logger.log(`✅ Upload réussi: ${result.cid}`);
            return {
                cid: result.cid.toString(),
                size: result.size,
                path: result.path
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur upload IPFS: ${error.message}`);
            return this.generateFakeResult(buffer, filename);
        }
    }
    async uploadMetadata(metadata) {
        const metadataJson = JSON.stringify(metadata, null, 2);
        const buffer = Buffer.from(metadataJson, 'utf8');
        if (!this.isConnected) {
            return this.generateFakeResult(buffer, 'metadata.json');
        }
        try {
            this.logger.log('📤 Upload des métadonnées vers IPFS...');
            const result = await this.ipfs.add(buffer, {
                pin: true
            });
            this.logger.log(`✅ Métadonnées uploadées: ${result.cid}`);
            return {
                cid: result.cid.toString(),
                size: result.size,
                path: result.path
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur upload métadonnées: ${error.message}`);
            return this.generateFakeResult(buffer, 'metadata.json');
        }
    }
    async uploadImageAndCreateMetadata(imageBuffer, filename, nftData) {
        try {
            const imageResult = await this.uploadFile(imageBuffer, filename);
            const metadata = {
                name: nftData.name,
                description: nftData.description || 'Un NFT créé avec DEFENDR',
                image: `ipfs://${imageResult.cid}`,
                attributes: nftData.attributes || {},
                created_at: new Date().toISOString()
            };
            const metadataResult = await this.uploadMetadata(metadata);
            return {
                imageCid: imageResult.cid,
                metadataCid: metadataResult.cid,
                metadata
            };
        }
        catch (error) {
            this.logger.error(`❌ Erreur upload image + métadonnées: ${error.message}`);
            throw error;
        }
    }
    async getFile(cid) {
        var _a, e_1, _b, _c;
        if (!this.isConnected) {
            throw new Error('IPFS non connecté - mode simulé');
        }
        try {
            const chunks = [];
            try {
                for (var _d = true, _e = __asyncValues(this.ipfs.cat(cid)), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            this.logger.error(`❌ Erreur récupération fichier: ${error.message}`);
            throw error;
        }
    }
    async getMetadata(cid) {
        if (!this.isConnected) {
            return this.generateFakeMetadata();
        }
        try {
            const buffer = await this.getFile(cid);
            const metadata = JSON.parse(buffer.toString('utf8'));
            return metadata;
        }
        catch (error) {
            this.logger.error(`❌ Erreur récupération métadonnées: ${error.message}`);
            return this.generateFakeMetadata();
        }
    }
    async checkConnection() {
        return this.isConnected;
    }
    getPublicUrl(cid) {
        return `https://ipfs.io/ipfs/${cid}`;
    }
    generateFakeResult(buffer, filename) {
        const fakeCid = this.generateFakeCid();
        this.logger.warn(`⚠️  Mode simulé - CID factice généré: ${fakeCid}`);
        return {
            cid: fakeCid,
            size: buffer.length,
            path: filename
        };
    }
    generateFakeCid() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'Qm';
        for (let i = 0; i < 44; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    generateFakeMetadata() {
        return {
            name: 'NFT Simulé',
            description: 'Métadonnées simulées - IPFS non connecté',
            image: 'ipfs://QmFakeImageCid',
            attributes: {
                simulated: true,
                ipfs_connected: false
            },
            created_at: new Date().toISOString()
        };
    }
};
exports.RealIpfsService = RealIpfsService;
exports.RealIpfsService = RealIpfsService = RealIpfsService_1 = __decorate([
    (0, common_1.Injectable)()
], RealIpfsService);
//# sourceMappingURL=real-ipfs.service.js.map