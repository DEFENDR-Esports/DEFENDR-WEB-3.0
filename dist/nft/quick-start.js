"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const API_BASE_URL = 'http://localhost:3000';
async function quickStart() {
    var _a;
    try {
        console.log('🚀 DÉMARRAGE RAPIDE - API NFT DEFENDR\n');
        console.log('1. Vérification de l\'API...');
        const healthResponse = await axios_1.default.get(`${API_BASE_URL}/nft/health`);
        console.log('✅ API opérationnelle:', healthResponse.data);
        console.log('');
        console.log('2. Création d\'un compte de test...');
        const accountResponse = await axios_1.default.post(`${API_BASE_URL}/nft/account/create`, {
            initialBalance: 5,
            maxTokenAssociations: 10
        });
        console.log('✅ Compte créé:', accountResponse.data);
        console.log('');
        console.log('3. Mint d\'un NFT simple...');
        const mintResponse = await axios_1.default.post(`${API_BASE_URL}/nft/mint`, {
            name: 'NFT de Test DEFENDR',
            description: 'Un NFT créé lors du démarrage rapide',
            attributes: {
                rarity: 'common',
                level: 1,
                created_by: 'quick-start'
            }
        });
        console.log('✅ NFT minté:', mintResponse.data);
        console.log('');
        console.log('4. Vérification des infos NFT...');
        const nftInfo = await axios_1.default.get(`${API_BASE_URL}/nft/info/${mintResponse.data.nftId}`);
        console.log('✅ Infos NFT:', nftInfo.data);
        console.log('');
        console.log('5. Vérification du solde...');
        const balance = await axios_1.default.get(`${API_BASE_URL}/nft/balance/${accountResponse.data.accountId}`);
        console.log('✅ Solde du compte:', balance.data);
        console.log('');
        console.log('🎉 DÉMARRAGE RAPIDE TERMINÉ AVEC SUCCÈS !');
        console.log('');
        console.log('📋 RÉSUMÉ:');
        console.log(`   - Compte créé: ${accountResponse.data.accountId}`);
        console.log(`   - NFT minté: ${mintResponse.data.nftId}`);
        console.log(`   - Solde HBAR: ${balance.data.hbarBalance}`);
        console.log('');
        console.log('🔗 Endpoints disponibles:');
        console.log('   - POST /nft/mint - Mint un NFT');
        console.log('   - POST /nft/mint/with-image - Upload image + mint');
        console.log('   - POST /nft/account/create - Créer un compte');
        console.log('   - GET /nft/balance/:accountId - Vérifier solde');
        console.log('   - POST /nft/transfer - Transférer NFT');
        console.log('   - Voir src/nft/README.md pour plus de détails');
    }
    catch (error) {
        console.error('❌ Erreur lors du démarrage rapide:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        console.log('');
        console.log('💡 Vérifiez que:');
        console.log('   1. Le serveur est démarré (npm run start:dev)');
        console.log('   2. Les variables d\'environnement sont configurées');
        console.log('   3. Vous êtes connecté au réseau Hedera testnet');
    }
}
quickStart();
//# sourceMappingURL=quick-start.js.map