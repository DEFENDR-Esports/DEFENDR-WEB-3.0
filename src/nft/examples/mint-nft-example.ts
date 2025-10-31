// Exemple d'utilisation de l'API NFT
// Ce fichier montre comment utiliser les endpoints NFT

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Exemple de minting d'un NFT
export async function mintNftExample() {
  try {
    const nftData = {
      name: 'Mon Premier NFT DEFENDR',
      description: 'Un NFT créé avec l\'API DEFENDR',
      image: 'https://example.com/nft-image.png',
      attributes: {
        rarity: 'legendary',
        level: 1,
        collection: 'DEFENDR',
        created_by: 'API'
      }
    };

    console.log('Minting NFT...');
    const response = await axios.post(`${API_BASE_URL}/nft/mint`, nftData);
    
    console.log('NFT minté avec succès:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors du minting:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple de récupération d'informations NFT
export async function getNftInfoExample(nftId: string) {
  try {
    console.log(`Récupération des infos pour NFT: ${nftId}`);
    const response = await axios.get(`${API_BASE_URL}/nft/info/${nftId}`);
    
    console.log('Informations NFT:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple de vérification de santé du service
export async function healthCheckExample() {
  try {
    const response = await axios.get(`${API_BASE_URL}/nft/health`);
    console.log('Statut du service NFT:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Erreur lors du health check:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation complète
export async function completeExample() {
  try {
    console.log('=== Exemple complet d\'utilisation de l\'API NFT ===\n');
    
    // 1. Vérifier la santé du service
    await healthCheckExample();
    console.log('\n---\n');
    
    // 2. Minter un NFT
    const nftResult = await mintNftExample();
    console.log('\n---\n');
    
    // 3. Récupérer les infos du NFT
    if (nftResult && nftResult.nftId) {
      await getNftInfoExample(nftResult.nftId);
    }
    
    console.log('\n=== Exemple terminé ===');
  } catch (error) {
    console.error('Erreur dans l\'exemple complet:', error);
  }
}

// Exécuter l'exemple si ce fichier est exécuté directement
if (require.main === module) {
  completeExample();
}
