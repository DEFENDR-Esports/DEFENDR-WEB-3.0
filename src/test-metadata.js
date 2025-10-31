// Test des métadonnées NFT
// Exécutez avec: node src/test-metadata.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000';

async function testMetadata() {
  try {
    console.log('🔍 Test des métadonnées NFT...\n');

    // 1. Créer et mint un NFT
    console.log('1. Création d\'un NFT de test...');
    
    // Créer une image PNG minimale
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const formData = new FormData();
    formData.append('image', pngData, {
      filename: 'test-metadata.png',
      contentType: 'image/png'
    });
    formData.append('name', 'NFT Test Métadonnées');
    formData.append('description', 'Un NFT pour tester les métadonnées');
    formData.append('attributes', JSON.stringify({
      rarity: 'epic',
      level: 1,
      artist: 'DEFENDR',
      test: true
    }));

    const mintResponse = await axios.post(
      `${API_BASE_URL}/nft/mint/with-image`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ NFT minté:');
    console.log(`   NFT ID: ${mintResponse.data.nftId}`);
    console.log(`   Image CID: ${mintResponse.data.imageCid}`);
    console.log(`   Métadonnées CID: ${mintResponse.data.metadataCid}`);
    console.log('');

    // 2. Récupérer les métadonnées IPFS
    console.log('2. Récupération des métadonnées IPFS...');
    const metadataResponse = await axios.get(`${API_BASE_URL}/nft/ipfs/metadata/${mintResponse.data.metadataCid}`);
    
    console.log('✅ Métadonnées IPFS:');
    console.log(`   CID: ${metadataResponse.data.cid}`);
    console.log(`   URL IPFS: ${metadataResponse.data.ipfsUrl}`);
    console.log(`   URL Publique: ${metadataResponse.data.publicUrl}`);
    console.log('   Métadonnées:');
    console.log(JSON.stringify(metadataResponse.data.metadata, null, 2));
    console.log('');

    // 3. Vérifier l'URL de l'image
    console.log('3. Vérification de l\'URL de l\'image...');
    const imageUrl = metadataResponse.data.metadata.image;
    console.log(`   URL de l'image: ${imageUrl}`);
    
    if (imageUrl && imageUrl.startsWith('ipfs://')) {
      const imageCid = imageUrl.replace('ipfs://', '');
      console.log(`   CID de l'image: ${imageCid}`);
      console.log(`   URL publique de l'image: https://ipfs.io/ipfs/${imageCid}`);
    }
    console.log('');

    // 4. Test de récupération des métadonnées NFT
    console.log('4. Test récupération métadonnées NFT...');
    try {
      const nftMetadataResponse = await axios.get(`${API_BASE_URL}/nft/metadata/${mintResponse.data.nftId}`);
      console.log('✅ Métadonnées NFT:');
      console.log(JSON.stringify(nftMetadataResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️  Métadonnées NFT non disponibles:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 5. Test des statistiques
    console.log('5. Test des statistiques...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/nft/metadata/stats`);
      console.log('✅ Statistiques:');
      console.log(JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️  Statistiques non disponibles:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Test des métadonnées terminé !');
    console.log('');
    console.log('📋 Résumé:');
    console.log(`   - NFT ID: ${mintResponse.data.nftId}`);
    console.log(`   - Image: ${metadataResponse.data.metadata.image}`);
    console.log(`   - Nom: ${metadataResponse.data.metadata.name}`);
    console.log(`   - Description: ${metadataResponse.data.metadata.description}`);

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMetadata();
