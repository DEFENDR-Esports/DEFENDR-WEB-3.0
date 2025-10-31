// Script de partage NFT
// Exécutez avec: node src/nft/share-nft.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Données de votre NFT
const nftData = {
  nftId: "0.0.6920218/4",
  tokenId: "0.0.6920218",
  serialNumber: 4,
  transactionId: "0.0.6498351@1759109984.030511890",
  imageCid: "QmJGmOKhe0DhRkvMJqGlBxLEg2Ur64gBSfg3ASYwUJMstp",
  metadataCid: "Qmq52B1xSptFUnnp6J6LjSMioqVoD3OBHuleixAe4Ms8R3"
};

async function shareNft() {
  try {
    console.log('🎨 PARTAGE DE VOTRE NFT DEFENDR\n');

    // URLs de base
    const imageUrl = `https://ipfs.io/ipfs/${nftData.imageCid}`;
    const metadataUrl = `https://ipfs.io/ipfs/${nftData.metadataCid}`;
    const hashscanUrl = `https://hashscan.io/testnet/token/${nftData.tokenId}`;

    console.log('📱 LIENS DE PARTAGE:');
    console.log('==================');
    console.log(`🖼️  Image: ${imageUrl}`);
    console.log(`📄 Métadonnées: ${metadataUrl}`);
    console.log(`🔍 HashScan: ${hashscanUrl}`);
    console.log('');

    // Récupérer les métadonnées complètes
    console.log('📋 MÉTADONNÉES COMPLÈTES:');
    console.log('========================');
    
    try {
      const metadataResponse = await axios.get(`${API_BASE_URL}/nft/metadata/${nftData.nftId}`);
      const metadata = metadataResponse.data;
      
      console.log(`Nom: ${metadata.metadata?.name || 'Non défini'}`);
      console.log(`Description: ${metadata.metadata?.description || 'Non définie'}`);
      console.log(`Image URL: ${metadata.imageUrl}`);
      console.log(`Créé le: ${metadata.createdAt}`);
      console.log('');
      
      if (metadata.metadata?.attributes) {
        console.log('Attributs:');
        Object.entries(metadata.metadata.attributes).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        console.log('');
      }
    } catch (error) {
      console.log('⚠️  Métadonnées non disponibles (serveur non démarré)');
      console.log('');
    }

    // Messages de partage prêts à l'emploi
    console.log('💬 MESSAGES DE PARTAGE:');
    console.log('======================');
    
    console.log('\n📱 Pour WhatsApp/Telegram:');
    console.log(`Regarde mon NFT DEFENDR ! 🎨`);
    console.log(`${imageUrl}`);
    console.log(`Détails: ${hashscanUrl}`);
    
    console.log('\n🐦 Pour Twitter:');
    console.log(`Just minted my first NFT on @Hedera! 🎨✨`);
    console.log(`Check it out: ${imageUrl}`);
    console.log(`#NFT #Hedera #DEFENDR #Blockchain`);
    
    console.log('\n📧 Pour Email:');
    console.log(`Sujet: Mon nouveau NFT DEFENDR`);
    console.log(`Salut !`);
    console.log(`J'ai créé mon premier NFT sur Hedera !`);
    console.log(`Tu peux le voir ici: ${imageUrl}`);
    console.log(`Détails techniques: ${hashscanUrl}`);
    console.log(`À bientôt !`);
    
    console.log('\n📋 Pour Discord/Slack:');
    console.log(`**Mon NFT DEFENDR** 🎨`);
    console.log(`Image: ${imageUrl}`);
    console.log(`HashScan: ${hashscanUrl}`);
    console.log(`NFT ID: \`${nftData.nftId}\``);

    // Générer le code HTML
    console.log('\n🌐 CODE HTML POUR SITE WEB:');
    console.log('==========================');
    console.log(`<div style="text-align: center; padding: 20px; border: 2px solid #667eea; border-radius: 10px; max-width: 400px;">`);
    console.log(`  <h3>Mon NFT DEFENDR</h3>`);
    console.log(`  <img src="${imageUrl}" style="width: 100%; border-radius: 8px; margin: 10px 0;" alt="NFT" />`);
    console.log(`  <p><strong>NFT ID:</strong> ${nftData.nftId}</p>`);
    console.log(`  <p><a href="${hashscanUrl}" target="_blank">Voir sur HashScan</a></p>`);
    console.log(`</div>`);

    console.log('\n🎉 Votre NFT est prêt à être partagé !');
    console.log('Ouvrez le fichier share-nft.html dans votre navigateur pour une présentation complète.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

shareNft();


