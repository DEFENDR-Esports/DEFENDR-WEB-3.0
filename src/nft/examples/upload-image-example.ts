// Exemple simple pour tester l'upload d'image et mint NFT
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = 'http://localhost:3000';

// Exemple d'upload d'image et mint NFT
export async function uploadImageAndMintNft() {
  try {
    console.log('=== UPLOAD IMAGE ET MINT NFT ===\n');

    // 1. Créer un fichier de test (image factice)
    const testImagePath = './test-image.png';
    await createTestImage(testImagePath);

    // 2. Préparer les données du formulaire
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    formData.append('name', 'Mon Super NFT avec Image');
    formData.append('description', 'Un NFT créé avec une image uploadée');
    formData.append('attributes', JSON.stringify({
      rarity: 'legendary',
      level: 1,
      collection: 'DEFENDR',
      created_by: 'API Upload'
    }));

    // 3. Upload et mint
    console.log('Upload de l\'image et mint du NFT...');
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

    console.log('NFT minté avec succès:');
    console.log(JSON.stringify(response.data, null, 2));

    // 4. Nettoyer le fichier de test
    fs.unlinkSync(testImagePath);
    console.log('\nFichier de test supprimé');

    return response.data;

  } catch (error) {
    console.error('Erreur lors de l\'upload et mint:', error.response?.data || error.message);
    throw error;
  }
}

// Créer une image de test simple (PNG minimal)
async function createTestImage(filePath: string): Promise<void> {
  // PNG minimal 1x1 pixel (format base64)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(filePath, pngData);
  console.log(`Image de test créée: ${filePath}`);
}

// Exemple avec une vraie image
export async function uploadRealImageAndMintNft(imagePath: string, nftData: {
  name: string;
  description?: string;
  attributes?: Record<string, any>;
}) {
  try {
    console.log('=== UPLOAD IMAGE RÉELLE ET MINT NFT ===\n');

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Fichier image non trouvé: ${imagePath}`);
    }

    // Vérifier le type de fichier
    const ext = path.extname(imagePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.');
    }

    // Préparer les données du formulaire
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('name', nftData.name);
    formData.append('description', nftData.description || '');
    formData.append('attributes', JSON.stringify(nftData.attributes || {}));

    // Upload et mint
    console.log(`Upload de l'image: ${imagePath}`);
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

    console.log('NFT minté avec succès:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;

  } catch (error) {
    console.error('Erreur lors de l\'upload et mint:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation
export async function runExamples() {
  try {
    console.log('=== EXEMPLES D\'UPLOAD ET MINT NFT ===\n');

    // Exemple 1: Image de test
    console.log('1. Test avec image factice...');
    await uploadImageAndMintNft();
    
    console.log('\n---\n');

    // Exemple 2: Image réelle (si vous en avez une)
    const realImagePath = './my-image.jpg'; // Remplacez par le chemin de votre image
    if (fs.existsSync(realImagePath)) {
      console.log('2. Test avec image réelle...');
      await uploadRealImageAndMintNft(realImagePath, {
        name: 'Mon NFT Personnalisé',
        description: 'Un NFT créé avec ma propre image',
        attributes: {
          rarity: 'epic',
          artist: 'Moi',
          year: 2024
        }
      });
    } else {
      console.log('2. Pas d\'image réelle trouvée, skip...');
    }

    console.log('\n=== EXEMPLES TERMINÉS ===');

  } catch (error) {
    console.error('Erreur dans les exemples:', error);
  }
}

// Exécuter les exemples si ce fichier est exécuté directement
if (require.main === module) {
  runExamples();
}

