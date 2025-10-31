// Exemple d'upload vers IPFS et mint NFT
// Exécutez avec: npx ts-node src/nft/examples/ipfs-upload-example.ts

import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

const API_BASE_URL = 'http://localhost:3000';

// Créer une image de test
function createTestImage(): string {
  const testImagePath = './test-ipfs-image.png';
  
  // PNG minimal 1x1 pixel (format base64)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(testImagePath, pngData);
  console.log(`✅ Image de test créée: ${testImagePath}`);
  return testImagePath;
}

async function testIpfsUpload() {
  try {
    console.log('🌐 TEST D\'UPLOAD IPFS ET MINT NFT\n');

    // 1. Vérifier la santé d'IPFS
    console.log('1. Vérification de la connectivité IPFS...');
    const ipfsHealth = await axios.get(`${API_BASE_URL}/nft/ipfs/health`);
    console.log('✅ IPFS Status:', ipfsHealth.data);
    console.log('');

    // 2. Créer une image de test
    console.log('2. Création d\'une image de test...');
    const imagePath = createTestImage();
    console.log('');

    // 3. Upload simple vers IPFS
    console.log('3. Upload simple vers IPFS...');
    const formData1 = new FormData();
    formData1.append('file', fs.createReadStream(imagePath));
    
    const uploadResult = await axios.post(
      `${API_BASE_URL}/nft/upload/ipfs`,
      formData1,
      {
        headers: {
          ...formData1.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ Upload IPFS réussi:');
    console.log(`   - CID: ${uploadResult.data.cid}`);
    console.log(`   - Taille: ${uploadResult.data.size} bytes`);
    console.log(`   - URL IPFS: ${uploadResult.data.ipfsUrl}`);
    console.log(`   - URL Publique: ${uploadResult.data.publicUrl}`);
    console.log('');

    // 4. Upload d'image et mint NFT
    console.log('4. Upload d\'image et mint NFT...');
    const formData2 = new FormData();
    formData2.append('image', fs.createReadStream(imagePath));
    formData2.append('name', 'NFT IPFS Test');
    formData2.append('description', 'Un NFT créé avec upload IPFS');
    formData2.append('attributes', JSON.stringify({
      rarity: 'epic',
      level: 1,
      artist: 'DEFENDR API',
      collection: 'IPFS Collection',
      created_at: new Date().toISOString(),
      ipfs_enabled: true
    }));

    const mintResult = await axios.post(
      `${API_BASE_URL}/nft/mint/with-image`,
      formData2,
      {
        headers: {
          ...formData2.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ NFT minté avec IPFS:');
    console.log(`   - NFT ID: ${mintResult.data.nftId}`);
    console.log(`   - Token ID: ${mintResult.data.tokenId}`);
    console.log(`   - Serial Number: ${mintResult.data.serialNumber}`);
    console.log(`   - Image CID: ${mintResult.data.imageCid}`);
    console.log(`   - Métadonnées CID: ${mintResult.data.metadataCid}`);
    console.log(`   - Transaction ID: ${mintResult.data.transactionId}`);
    console.log('');

    // 5. Afficher les URLs IPFS
    console.log('5. URLs IPFS générées:');
    console.log(`   - Image: ipfs://${mintResult.data.imageCid}`);
    console.log(`   - Métadonnées: ipfs://${mintResult.data.metadataCid}`);
    console.log(`   - Image publique: https://ipfs.io/ipfs/${mintResult.data.imageCid}`);
    console.log(`   - Métadonnées publiques: https://ipfs.io/ipfs/${mintResult.data.metadataCid}`);
    console.log('');

    // 6. Nettoyer
    console.log('6. Nettoyage...');
    fs.unlinkSync(imagePath);
    console.log('✅ Fichier de test supprimé');
    console.log('');

    console.log('🎉 TEST IPFS TERMINÉ AVEC SUCCÈS !');
    console.log('');
    console.log('📝 Avantages d\'IPFS:');
    console.log('   - Stockage décentralisé et permanent');
    console.log('   - CIDs uniques et immutables');
    console.log('   - Compatible avec les standards NFT');
    console.log('   - Pas de dépendance à un serveur central');
    console.log('');
    console.log('🔗 Endpoints utilisés:');
    console.log('   - GET /nft/ipfs/health - Vérifier IPFS');
    console.log('   - POST /nft/upload/ipfs - Upload simple');
    console.log('   - POST /nft/mint/with-image - Upload + mint');

  } catch (error) {
    console.error('❌ Erreur lors du test IPFS:', error.response?.data || error.message);
    console.log('');
    console.log('💡 Vérifiez que:');
    console.log('   1. Le serveur est démarré (npm run start:dev)');
    console.log('   2. IPFS est correctement configuré');
    console.log('   3. Les variables d\'environnement sont définies');
  }
}

// Test avec une vraie image
export async function testWithRealImage(imagePath: string, nftData: {
  name: string;
  description?: string;
  attributes?: Record<string, any>;
}) {
  try {
    console.log('🖼️  TEST AVEC IMAGE RÉELLE ET IPFS\n');

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Fichier image non trouvé: ${imagePath}`);
    }

    // Vérifier le type de fichier
    const ext = imagePath.toLowerCase().split('.').pop();
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.');
    }

    // Upload et mint
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('name', nftData.name);
    formData.append('description', nftData.description || '');
    formData.append('attributes', JSON.stringify(nftData.attributes || {}));

    const result = await axios.post(
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

    console.log('✅ NFT créé avec image réelle:');
    console.log(JSON.stringify(result.data, null, 2));

    return result.data;

  } catch (error) {
    console.error('❌ Erreur avec image réelle:', error.response?.data || error.message);
    throw error;
  }
}

// Exécuter le test
if (require.main === module) {
  testIpfsUpload();
}

