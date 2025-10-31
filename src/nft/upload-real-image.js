// Script pour uploader une vraie image sur IPFS
// Exécutez avec: node src/nft/upload-real-image.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000';

async function uploadRealImage() {
  try {
    console.log('🖼️  Upload d\'une vraie image sur IPFS...\n');

    // Créer une vraie image PNG (1x1 pixel transparent)
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    const formData = new FormData();
    formData.append('image', pngData, {
      filename: 'real-nft-image.png',
      contentType: 'image/png'
    });

    console.log('1. Upload de l\'image...');
    const uploadResponse = await axios.post(
      `${API_BASE_URL}/nft/upload/ipfs`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ Image uploadée:');
    console.log(`   CID: ${uploadResponse.data.cid}`);
    console.log(`   URL: https://ipfs.io/ipfs/${uploadResponse.data.cid}`);
    console.log('');

    // Tester l'URL
    console.log('2. Test de l\'URL IPFS...');
    try {
      const testResponse = await axios.get(`https://ipfs.io/ipfs/${uploadResponse.data.cid}`, {
        timeout: 10000
      });
      console.log('✅ URL IPFS fonctionne !');
      console.log(`   Taille: ${testResponse.data.length} bytes`);
    } catch (error) {
      console.log('⚠️  URL IPFS non accessible (normal en mode simulé)');
      console.log(`   Erreur: ${error.message}`);
    }

    console.log('\n3. Mint NFT avec cette image...');
    const mintFormData = new FormData();
    mintFormData.append('image', pngData, {
      filename: 'real-nft.png',
      contentType: 'image/png'
    });
    mintFormData.append('name', 'NFT avec Vraie Image');
    mintFormData.append('description', 'Un NFT avec une vraie image IPFS');
    mintFormData.append('attributes', JSON.stringify({
      type: 'real_image',
      rarity: 'common',
      test: true
    }));

    const mintResponse = await axios.post(
      `${API_BASE_URL}/nft/mint/with-image`,
      mintFormData,
      {
        headers: mintFormData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ NFT minté avec succès !');
    console.log(`   NFT ID: ${mintResponse.data.nftId}`);
    console.log(`   Image CID: ${mintResponse.data.imageCid}`);
    console.log(`   Métadonnées CID: ${mintResponse.data.metadataCid}`);
    console.log('');

    console.log('🔗 LIENS DE PARTAGE:');
    console.log('==================');
    console.log(`Image: https://ipfs.io/ipfs/${mintResponse.data.imageCid}`);
    console.log(`HashScan: https://hashscan.io/testnet/token/${mintResponse.data.tokenId}`);
    console.log('');

    console.log('💡 NOTE:');
    console.log('En mode simulé, les CIDs sont générés localement.');
    console.log('Pour une vraie intégration IPFS, configurez un nœud IPFS.');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

uploadRealImage();


