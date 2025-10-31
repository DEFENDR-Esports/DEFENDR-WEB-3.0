// Test simple IPFS
// Exécutez avec: npx ts-node src/test-ipfs-simple.ts

import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';

async function testIpfs() {
  try {
    console.log('🚀 Test simple IPFS...');
    
    // Créer une instance Helia
    const helia = await createHelia();
    const fs = unixfs(helia);
    
    console.log('✅ Helia créé');
    
    // Test d'upload
    const testData = Buffer.from('Hello IPFS from DEFENDR!', 'utf8');
    const cid = await fs.addBytes(testData);
    
    console.log('✅ Fichier uploadé:');
    console.log(`   CID: ${cid.toString()}`);
    
    // Test de récupération
    const chunks: Uint8Array[] = [];
    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }
    
    const retrievedData = Buffer.concat(chunks);
    console.log('✅ Fichier récupéré:');
    console.log(`   Contenu: ${retrievedData.toString()}`);
    
    // Nettoyer
    await helia.stop();
    console.log('✅ Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testIpfs();





