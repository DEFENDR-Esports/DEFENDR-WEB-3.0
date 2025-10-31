"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const form_data_1 = require("form-data");
const fs = require("fs");
const API_BASE_URL = 'http://localhost:3000';
async function testIpfsFixed() {
    var _a;
    try {
        console.log('🚀 Test IPFS corrigé...\n');
        console.log('1. Vérification IPFS...');
        const health = await axios_1.default.get(`${API_BASE_URL}/nft/ipfs/health`);
        console.log('✅ IPFS:', health.data.connected ? 'Connecté' : 'Déconnecté');
        console.log('');
        console.log('2. Création fichier de test...');
        const testFile = './test-ipfs-fixed.txt';
        fs.writeFileSync(testFile, 'Hello IPFS from DEFENDR (Fixed)!');
        console.log('✅ Fichier créé');
        console.log('');
        console.log('3. Upload vers IPFS...');
        const formData = new form_data_1.default();
        formData.append('image', fs.createReadStream(testFile));
        const upload = await axios_1.default.post(`${API_BASE_URL}/nft/upload/ipfs`, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log('✅ Upload réussi:');
        console.log(`   CID: ${upload.data.cid}`);
        console.log(`   Taille: ${upload.data.size} bytes`);
        console.log(`   URL IPFS: ${upload.data.ipfsUrl}`);
        console.log(`   URL Publique: ${upload.data.publicUrl}`);
        console.log('');
        console.log('4. Test upload image et mint NFT...');
        const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        const imageFormData = new form_data_1.default();
        imageFormData.append('image', imageData, {
            filename: 'test-nft.png',
            contentType: 'image/png'
        });
        imageFormData.append('name', 'NFT Test IPFS');
        imageFormData.append('description', 'Un NFT de test avec IPFS');
        imageFormData.append('attributes', JSON.stringify({
            rarity: 'common',
            test: true,
            ipfs_enabled: true
        }));
        const mintResult = await axios_1.default.post(`${API_BASE_URL}/nft/mint/with-image`, imageFormData, {
            headers: imageFormData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log('✅ NFT minté avec IPFS:');
        console.log(`   NFT ID: ${mintResult.data.nftId}`);
        console.log(`   Image CID: ${mintResult.data.imageCid}`);
        console.log(`   Métadonnées CID: ${mintResult.data.metadataCid}`);
        console.log('');
        fs.unlinkSync(testFile);
        console.log('✅ Test terminé avec succès !');
    }
    catch (error) {
        console.error('❌ Erreur:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
testIpfsFixed();
//# sourceMappingURL=test-ipfs-simple-fixed.js.map