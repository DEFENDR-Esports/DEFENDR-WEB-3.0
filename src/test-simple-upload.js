// Test simple d'upload - Node.js
// Exécutez avec: node src/test-simple-upload.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000';

async function testSimpleUpload() {
  try {
    console.log('🚀 Test simple d\'upload...\n');

    // 1. Créer un fichier de test
    console.log('1. Création fichier de test...');
    const testFile = './test-simple.txt';
    fs.writeFileSync(testFile, 'Hello DEFENDR!');
    console.log('✅ Fichier créé');
    console.log('');

    // 2. Test upload simple vers IPFS
    console.log('2. Test upload vers IPFS...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testFile));

    const uploadResponse = await axios.post(`${API_BASE_URL}/nft/upload/ipfs`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('✅ Upload réussi:');
    console.log(`   CID: ${uploadResponse.data.cid}`);
    console.log(`   Taille: ${uploadResponse.data.size} bytes`);
    console.log('');

    // 3. Test mint NFT avec image
    console.log('3. Test mint NFT avec image...');
    
    // Créer une image PNG minimale
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const mintFormData = new FormData();
    mintFormData.append('image', pngData, {
      filename: 'test-nft.png',
      contentType: 'image/png'
    });
    mintFormData.append('name', 'NFT Test Simple');
    mintFormData.append('description', 'Un NFT de test simple');
    mintFormData.append('attributes', JSON.stringify({
      rarity: 'common',
      test: true,
      simple: true
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

    console.log('✅ NFT minté:');
    console.log(`   NFT ID: ${mintResponse.data.nftId}`);
    console.log(`   Image CID: ${mintResponse.data.imageCid}`);
    console.log(`   Métadonnées CID: ${mintResponse.data.metadataCid}`);
    console.log('');

    // 4. Nettoyer
    fs.unlinkSync(testFile);
    console.log('✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSimpleUpload();


