// Test du vrai service IPFS
// Exécutez avec: node src/nft/test-real-ipfs.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000';

async function testRealIpfs() {
  try {
    console.log('🧪 Test du vrai service IPFS...\n');

    // 1. Vérifier la connectivité IPFS
    console.log('1. Vérification de la connectivité IPFS...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/nft/ipfs/health`);
      console.log('✅ Connectivité IPFS:', healthResponse.data);
    } catch (error) {
      console.log('❌ Erreur connectivité IPFS:', error.response?.data || error.message);
    }
    console.log('');

    // 2. Créer une vraie image PNG
    console.log('2. Création d\'une vraie image PNG...');
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    console.log(`   Taille de l'image: ${pngData.length} bytes`);
    console.log('');

    // 3. Upload de l'image vers IPFS
    console.log('3. Upload de l\'image vers IPFS...');
    const formData = new FormData();
    formData.append('image', pngData, {
      filename: 'test-real-image.png',
      contentType: 'image/png'
    });

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
    console.log(`   Taille: ${uploadResponse.data.size} bytes`);
    console.log(`   URL IPFS: https://ipfs.io/ipfs/${uploadResponse.data.cid}`);
    console.log('');

    // 4. Test de l'URL IPFS
    console.log('4. Test de l\'URL IPFS...');
    const ipfsUrl = `https://ipfs.io/ipfs/${uploadResponse.data.cid}`;
    console.log(`   Test de: ${ipfsUrl}`);
    
    try {
      const testResponse = await axios.get(ipfsUrl, { timeout: 10000 });
      console.log('✅ URL IPFS accessible !');
      console.log(`   Taille reçue: ${testResponse.data.length} bytes`);
      console.log(`   Type: ${testResponse.headers['content-type'] || 'inconnu'}`);
    } catch (error) {
      console.log('⚠️  URL IPFS non accessible (normal si IPFS local)');
      console.log(`   Erreur: ${error.message}`);
    }
    console.log('');

    // 5. Mint NFT avec cette image
    console.log('5. Mint NFT avec cette image...');
    const mintFormData = new FormData();
    mintFormData.append('image', pngData, {
      filename: 'real-nft-test.png',
      contentType: 'image/png'
    });
    mintFormData.append('name', 'NFT avec Vraie Image IPFS');
    mintFormData.append('description', 'Un NFT utilisant de vraies images IPFS');
    mintFormData.append('attributes', JSON.stringify({
      type: 'real_ipfs',
      rarity: 'epic',
      test: true,
      ipfs_connected: true
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

    // 6. Récupérer les métadonnées
    console.log('6. Récupération des métadonnées...');
    try {
      const metadataResponse = await axios.get(`${API_BASE_URL}/nft/metadata/${mintResponse.data.nftId}`);
      console.log('✅ Métadonnées récupérées:');
      console.log(JSON.stringify(metadataResponse.data, null, 2));
    } catch (error) {
      console.log('⚠️  Métadonnées non disponibles:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 7. Test de l'image finale
    console.log('7. Test de l\'image finale...');
    const finalImageUrl = `https://ipfs.io/ipfs/${mintResponse.data.imageCid}`;
    console.log(`   URL finale: ${finalImageUrl}`);
    
    try {
      const finalTestResponse = await axios.get(finalImageUrl, { timeout: 10000 });
      console.log('✅ Image finale accessible !');
      console.log(`   Taille: ${finalTestResponse.data.length} bytes`);
    } catch (error) {
      console.log('⚠️  Image finale non accessible');
      console.log(`   Erreur: ${error.message}`);
    }

    console.log('');
    console.log('🎉 Test terminé !');
    console.log('');
    console.log('📋 Résumé:');
    console.log(`   - NFT ID: ${mintResponse.data.nftId}`);
    console.log(`   - Image: ${finalImageUrl}`);
    console.log(`   - HashScan: https://hashscan.io/testnet/token/${mintResponse.data.tokenId}`);

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRealIpfs();


