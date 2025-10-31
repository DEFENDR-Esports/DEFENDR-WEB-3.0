"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const form_data_1 = require("form-data");
const fs = require("fs");
const API_BASE_URL = 'http://localhost:3000';
async function quickIpfsTest() {
    var _a;
    try {
        console.log('🚀 TEST RAPIDE IPFS\n');
        console.log('1. Vérification IPFS...');
        const health = await axios_1.default.get(`${API_BASE_URL}/nft/ipfs/health`);
        console.log('✅ IPFS:', health.data.connected ? 'Connecté' : 'Déconnecté');
        console.log('');
        console.log('2. Création fichier de test...');
        const testFile = './test-ipfs.txt';
        fs.writeFileSync(testFile, 'Hello IPFS from DEFENDR!');
        console.log('✅ Fichier créé');
        console.log('');
        console.log('3. Upload vers IPFS...');
        const formData = new form_data_1.default();
        formData.append('file', fs.createReadStream(testFile));
        const upload = await axios_1.default.post(`${API_BASE_URL}/nft/upload/ipfs`, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log('✅ Upload réussi:');
        console.log(`   CID: ${upload.data.cid}`);
        console.log(`   URL: ${upload.data.publicUrl}`);
        console.log('');
        fs.unlinkSync(testFile);
        console.log('✅ Test terminé !');
    }
    catch (error) {
        console.error('❌ Erreur:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
quickIpfsTest();
//# sourceMappingURL=test-ipfs-quick.js.map