"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintNftExample = mintNftExample;
exports.getNftInfoExample = getNftInfoExample;
exports.healthCheckExample = healthCheckExample;
exports.completeExample = completeExample;
const axios_1 = require("axios");
const API_BASE_URL = 'http://localhost:3000';
async function mintNftExample() {
    var _a;
    try {
        const nftData = {
            name: 'Mon Premier NFT DEFENDR',
            description: 'Un NFT créé avec l\'API DEFENDR',
            image: 'https://example.com/nft-image.png',
            attributes: {
                rarity: 'legendary',
                level: 1,
                collection: 'DEFENDR',
                created_by: 'API'
            }
        };
        console.log('Minting NFT...');
        const response = await axios_1.default.post(`${API_BASE_URL}/nft/mint`, nftData);
        console.log('NFT minté avec succès:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    }
    catch (error) {
        console.error('Erreur lors du minting:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
async function getNftInfoExample(nftId) {
    var _a;
    try {
        console.log(`Récupération des infos pour NFT: ${nftId}`);
        const response = await axios_1.default.get(`${API_BASE_URL}/nft/info/${nftId}`);
        console.log('Informations NFT:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    }
    catch (error) {
        console.error('Erreur lors de la récupération:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
async function healthCheckExample() {
    var _a;
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/nft/health`);
        console.log('Statut du service NFT:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    }
    catch (error) {
        console.error('Erreur lors du health check:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
async function completeExample() {
    try {
        console.log('=== Exemple complet d\'utilisation de l\'API NFT ===\n');
        await healthCheckExample();
        console.log('\n---\n');
        const nftResult = await mintNftExample();
        console.log('\n---\n');
        if (nftResult && nftResult.nftId) {
            await getNftInfoExample(nftResult.nftId);
        }
        console.log('\n=== Exemple terminé ===');
    }
    catch (error) {
        console.error('Erreur dans l\'exemple complet:', error);
    }
}
if (require.main === module) {
    completeExample();
}
//# sourceMappingURL=mint-nft-example.js.map