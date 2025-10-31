// Test rapide IPFS
// Exécutez avec: npx ts-node src/nft/test-ipfs-quick.ts

import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

const API_BASE_URL = 'http://localhost:3000';

async function quickIpfsTest() {
  try {
    console.log('🚀 TEST RAPIDE IPFS\n');

    // 1. Vérifier IPFS
    console.log('1. Vérification IPFS...');
    const health = await axios.get(`${API_BASE_URL}/nft/ipfs/health`);
    console.log('✅ IPFS:', health.data.connected ? 'Connecté' : 'Déconnecté');
    console.log('');

    // 2. Créer un fichier de test
    console.log('2. Création fichier de test...');
    const testFile = './test-ipfs.txt';
    fs.writeFileSync(testFile, 'Hello IPFS from DEFENDR!');
    console.log('✅ Fichier créé');
    console.log('');

    // 3. Upload vers IPFS
    console.log('3. Upload vers IPFS...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));
    
    const upload = await axios.post(`${API_BASE_URL}/nft/upload/ipfs`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('✅ Upload réussi:');
    console.log(`   CID: ${upload.data.cid}`);
    console.log(`   URL: ${upload.data.publicUrl}`);
    console.log('');

    // 4. Nettoyer
    fs.unlinkSync(testFile);
    console.log('✅ Test terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

quickIpfsTest();

