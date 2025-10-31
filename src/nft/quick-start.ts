// Script de démarrage rapide pour tester l'API NFT
// Exécutez avec: npx ts-node src/nft/quick-start.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

async function quickStart() {
  try {
    console.log('🚀 DÉMARRAGE RAPIDE - API NFT DEFENDR\n');

    // 1. Vérifier que l'API fonctionne
    console.log('1. Vérification de l\'API...');
    const healthResponse = await axios.get(`${API_BASE_URL}/nft/health`);
    console.log('✅ API opérationnelle:', healthResponse.data);
    console.log('');

    // 2. Créer un compte de test
    console.log('2. Création d\'un compte de test...');
    const accountResponse = await axios.post(`${API_BASE_URL}/nft/account/create`, {
      initialBalance: 5,
      maxTokenAssociations: 10
    });
    console.log('✅ Compte créé:', accountResponse.data);
    console.log('');

    // 3. Mint un NFT simple
    console.log('3. Mint d\'un NFT simple...');
    const mintResponse = await axios.post(`${API_BASE_URL}/nft/mint`, {
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

    // 4. Vérifier les infos du NFT
    console.log('4. Vérification des infos NFT...');
    const nftInfo = await axios.get(`${API_BASE_URL}/nft/info/${mintResponse.data.nftId}`);
    console.log('✅ Infos NFT:', nftInfo.data);
    console.log('');

    // 5. Vérifier le solde du compte
    console.log('5. Vérification du solde...');
    const balance = await axios.get(`${API_BASE_URL}/nft/balance/${accountResponse.data.accountId}`);
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

  } catch (error) {
    console.error('❌ Erreur lors du démarrage rapide:', error.response?.data || error.message);
    console.log('');
    console.log('💡 Vérifiez que:');
    console.log('   1. Le serveur est démarré (npm run start:dev)');
    console.log('   2. Les variables d\'environnement sont configurées');
    console.log('   3. Vous êtes connecté au réseau Hedera testnet');
  }
}

// Exécuter le démarrage rapide
quickStart();
