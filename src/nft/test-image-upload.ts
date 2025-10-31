// Script pour tester l'upload d'image et mint NFT
// Exécutez avec: npx ts-node src/nft/test-image-upload.ts

import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = 'http://localhost:3000';

// Créer une image de test simple
function createTestImage(): string {
  const testImagePath = './test-nft-image.png';
  
  // PNG minimal 1x1 pixel (format base64)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(testImagePath, pngData);
  console.log(`✅ Image de test créée: ${testImagePath}`);
  return testImagePath;
}

async function testImageUpload() {
  try {
    console.log('🖼️  TEST D\'UPLOAD D\'IMAGE ET MINT NFT\n');

    // 1. Créer une image de test
    console.log('1. Création d\'une image de test...');
    const imagePath = createTestImage();
    console.log('');

    // 2. Préparer les données du formulaire
    console.log('2. Préparation des données...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('name', 'NFT Test avec Image');
    formData.append('description', 'Un NFT créé avec une image uploadée via l\'API');
    formData.append('attributes', JSON.stringify({
      rarity: 'epic',
      level: 1,
      artist: 'DEFENDR API',
      collection: 'Test Collection',
      created_at: new Date().toISOString()
    }));
    console.log('✅ Données préparées');
    console.log('');

    // 3. Upload et mint
    console.log('3. Upload de l\'image et mint du NFT...');
    const response = await axios.post(
      `${API_BASE_URL}/nft/mint/with-image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ NFT minté avec succès !');
    console.log('📋 Détails du NFT:');
    console.log(`   - NFT ID: ${response.data.nftId}`);
    console.log(`   - Token ID: ${response.data.tokenId}`);
    console.log(`   - Serial Number: ${response.data.serialNumber}`);
    console.log(`   - Transaction ID: ${response.data.transactionId}`);
    console.log('');

    // 4. Vérifier les infos du NFT
    console.log('4. Vérification des informations NFT...');
    const nftInfo = await axios.get(`${API_BASE_URL}/nft/info/${response.data.nftId}`);
    console.log('✅ Infos NFT récupérées:', nftInfo.data);
    console.log('');

    // 5. Nettoyer
    console.log('5. Nettoyage...');
    fs.unlinkSync(imagePath);
    console.log('✅ Fichier de test supprimé');
    console.log('');

    console.log('🎉 TEST D\'UPLOAD TERMINÉ AVEC SUCCÈS !');
    console.log('');
    console.log('📝 Pour tester avec votre propre image:');
    console.log('   1. Placez votre image dans le dossier du projet');
    console.log('   2. Modifiez le script pour utiliser votre image');
    console.log('   3. Relancez le test');
    console.log('');
    console.log('🔗 Endpoint utilisé: POST /nft/mint/with-image');
    console.log('📖 Voir src/nft/README.md pour plus de détails');

  } catch (error) {
    console.error('❌ Erreur lors du test d\'upload:', error.response?.data || error.message);
    console.log('');
    console.log('💡 Vérifiez que:');
    console.log('   1. Le serveur est démarré (npm run start:dev)');
    console.log('   2. Le dossier uploads/ existe');
    console.log('   3. Les variables d\'environnement sont configurées');
  }
}

// Exécuter le test
testImageUpload();

