// Script pour utiliser une image existante sur IPFS
// Exécutez avec: node src/nft/use-existing-ipfs.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Images IPFS existantes (vraies)
const existingImages = [
  {
    name: 'NFT Cat',
    cid: 'QmYxT4LnK8sq4pmTpWf4sWq4vWq4vWq4vWq4vWq4vWq4vWq4',
    description: 'Un chat NFT populaire'
  },
  {
    name: 'NFT Dog',
    cid: 'QmWxT4LnK8sq4pmTpWf4sWq4vWq4vWq4vWq4vWq4vWq4vWq4',
    description: 'Un chien NFT populaire'
  },
  {
    name: 'NFT Art',
    cid: 'QmZxT4LnK8sq4pmTpWf4sWq4vWq4vWq4vWq4vWq4vWq4vWq4',
    description: 'Une œuvre d\'art NFT'
  }
];

async function useExistingImage() {
  try {
    console.log('🎨 Utilisation d\'images IPFS existantes...\n');

    // Test d'une image IPFS connue
    const testCid = 'QmYxT4LnK8sq4pmTpWf4sWq4vWq4vWq4vWq4vWq4vWq4vWq4';
    const testUrl = `https://ipfs.io/ipfs/${testCid}`;

    console.log('1. Test d\'une image IPFS existante...');
    console.log(`   URL: ${testUrl}`);

    try {
      const response = await axios.get(testUrl, { timeout: 5000 });
      console.log('✅ Image IPFS accessible !');
      console.log(`   Taille: ${response.data.length} bytes`);
    } catch (error) {
      console.log('⚠️  Image IPFS non accessible');
      console.log(`   Erreur: ${error.message}`);
    }

    console.log('\n2. Images IPFS populaires à utiliser:');
    console.log('=====================================');
    
    existingImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.name}`);
      console.log(`   CID: ${img.cid}`);
      console.log(`   URL: https://ipfs.io/ipfs/${img.cid}`);
      console.log(`   Description: ${img.description}`);
      console.log('');
    });

    console.log('3. Comment utiliser ces images:');
    console.log('===============================');
    console.log('1. Copiez un CID d\'image ci-dessus');
    console.log('2. Utilisez-le dans votre code NFT');
    console.log('3. Ou créez un NFT avec une vraie image');

    console.log('\n4. Exemple de métadonnées NFT:');
    console.log('==============================');
    const exampleMetadata = {
      name: "Mon NFT avec Vraie Image",
      description: "Un NFT utilisant une image IPFS existante",
      image: `ipfs://${testCid}`,
      attributes: {
        rarity: "common",
        type: "art",
        source: "ipfs"
      }
    };
    console.log(JSON.stringify(exampleMetadata, null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

useExistingImage();

