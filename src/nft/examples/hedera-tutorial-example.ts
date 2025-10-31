// Exemple complet basé sur le tutoriel Hedera NFT
// https://docs.hedera.com/hedera/tutorials/token/hedera-token-service-part-1-how-to-mint-nfts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Exemple de workflow complet du tutoriel Hedera
export async function hederaTutorialExample() {
  try {
    console.log('=== TUTORIEL HEDERA NFT - WORKFLOW COMPLET ===\n');

    // 1. Créer des comptes Alice et Bob
    console.log('1. Création des comptes Alice et Bob...');
    
    const aliceAccount = await createAccount({ initialBalance: 10, maxTokenAssociations: 10 });
    console.log('Alice créée:', aliceAccount);
    
    const bobAccount = await createAccount({ initialBalance: 10, maxTokenAssociations: 10 });
    console.log('Bob créé:', bobAccount);
    
    console.log('\n---\n');

    // 2. Créer un token NFT avec frais personnalisés
    console.log('2. Création du token NFT "Fall Collection"...');
    
    const nftToken = await createNftToken({
      tokenName: 'Fall Collection',
      tokenSymbol: 'LEAF',
      maxSupply: 5,
      customFeeAmount: 1000000 // 0.1 HBAR en tinybar
    });
    console.log('Token NFT créé:', nftToken);
    
    console.log('\n---\n');

    // 3. Minter des NFTs avec des CIDs (métadonnées)
    console.log('3. Minting des NFTs...');
    
    const cids = [
      'QmHash1...',
      'QmHash2...',
      'QmHash3...',
      'QmHash4...',
      'QmHash5...'
    ];
    
    const mintResult = await mintNftBatch(nftToken.tokenId, cids);
    console.log('NFTs mintés:', mintResult);
    
    console.log('\n---\n');

    // 4. Vérifier les informations du token
    console.log('4. Informations du token...');
    
    const tokenInfo = await getTokenInfo(nftToken.tokenId);
    console.log('Infos token:', JSON.stringify(tokenInfo, null, 2));
    
    console.log('\n---\n');

    // 5. Activer l'auto-association pour Alice
    console.log('5. Activation auto-association pour Alice...');
    
    const aliceAutoAssoc = await enableAutoAssociation(
      aliceAccount.accountId,
      aliceAccount.privateKey,
      10
    );
    console.log('Auto-association Alice:', aliceAutoAssoc);
    
    console.log('\n---\n');

    // 6. Association manuelle pour Bob
    console.log('6. Association manuelle pour Bob...');
    
    const bobAssoc = await associateToken(
      bobAccount.accountId,
      nftToken.tokenId,
      bobAccount.privateKey
    );
    console.log('Association Bob:', bobAssoc);
    
    console.log('\n---\n');

    // 7. Vérifier les balances initiales
    console.log('7. Vérification des balances initiales...');
    
    const treasuryBalance = await getAccountBalance('0.0.123456', nftToken.tokenId); // Treasury ID
    const aliceBalance = await getAccountBalance(aliceAccount.accountId, nftToken.tokenId);
    const bobBalance = await getAccountBalance(bobAccount.accountId, nftToken.tokenId);
    
    console.log('Treasury balance:', treasuryBalance);
    console.log('Alice balance:', aliceBalance);
    console.log('Bob balance:', bobBalance);
    
    console.log('\n---\n');

    // 8. Premier transfert : Treasury -> Alice
    console.log('8. Premier transfert : Treasury -> Alice...');
    
    const transfer1 = await transferNft({
      tokenId: nftToken.tokenId,
      serialNumber: 2,
      fromAccountId: '0.0.123456', // Treasury ID
      toAccountId: aliceAccount.accountId,
      fromPrivateKey: 'TREASURY_PRIVATE_KEY' // Clé du treasury
    });
    console.log('Transfert 1:', transfer1);
    
    console.log('\n---\n');

    // 9. Vérifier les balances après transfert 1
    console.log('9. Vérification des balances après transfert 1...');
    
    const treasuryBalance2 = await getAccountBalance('0.0.123456', nftToken.tokenId);
    const aliceBalance2 = await getAccountBalance(aliceAccount.accountId, nftToken.tokenId);
    const bobBalance2 = await getAccountBalance(bobAccount.accountId, nftToken.tokenId);
    
    console.log('Treasury balance:', treasuryBalance2);
    console.log('Alice balance:', aliceBalance2);
    console.log('Bob balance:', bobBalance2);
    
    console.log('\n---\n');

    // 10. Deuxième transfert : Alice -> Bob (avec prix)
    console.log('10. Deuxième transfert : Alice -> Bob (avec prix)...');
    
    const transfer2 = await transferNft({
      tokenId: nftToken.tokenId,
      serialNumber: 2,
      fromAccountId: aliceAccount.accountId,
      toAccountId: bobAccount.accountId,
      fromPrivateKey: aliceAccount.privateKey,
      toPrivateKey: bobAccount.privateKey,
      price: 1 // 1 HBAR
    });
    console.log('Transfert 2:', transfer2);
    
    console.log('\n---\n');

    // 11. Vérifier les balances finales
    console.log('11. Vérification des balances finales...');
    
    const treasuryBalance3 = await getAccountBalance('0.0.123456', nftToken.tokenId);
    const aliceBalance3 = await getAccountBalance(aliceAccount.accountId, nftToken.tokenId);
    const bobBalance3 = await getAccountBalance(bobAccount.accountId, nftToken.tokenId);
    
    console.log('Treasury balance:', treasuryBalance3);
    console.log('Alice balance:', aliceBalance3);
    console.log('Bob balance:', bobBalance3);
    
    console.log('\n---\n');

    // 12. Brûler le dernier NFT
    console.log('12. Brûlage du dernier NFT...');
    
    const burnResult = await burnNft(nftToken.tokenId, 5);
    console.log('NFT brûlé:', burnResult);
    
    console.log('\n---\n');

    // 13. Vérifier le supply final
    console.log('13. Vérification du supply final...');
    
    const finalTokenInfo = await getTokenInfo(nftToken.tokenId);
    console.log('Supply final:', finalTokenInfo.totalSupply);
    
    console.log('\n=== TUTORIEL TERMINÉ ===');
    
  } catch (error) {
    console.error('Erreur dans le tutoriel:', error.response?.data || error.message);
  }
}

// Fonctions utilitaires
async function createAccount(request: any) {
  const response = await axios.post(`${API_BASE_URL}/nft/account/create`, request);
  return response.data;
}

async function createNftToken(request: any) {
  const response = await axios.post(`${API_BASE_URL}/nft/token/create`, request);
  return response.data;
}

async function mintNftBatch(tokenId: string, cids: string[]) {
  const response = await axios.post(`${API_BASE_URL}/nft/mint/batch`, {
    tokenId,
    cids
  });
  return response.data;
}

async function getTokenInfo(tokenId: string) {
  const response = await axios.get(`${API_BASE_URL}/nft/token/info/${tokenId}`);
  return response.data;
}

async function enableAutoAssociation(accountId: string, privateKey: string, maxAssociations: number) {
  const response = await axios.post(`${API_BASE_URL}/nft/account/auto-associate`, {
    accountId,
    privateKey,
    maxAssociations
  });
  return response.data;
}

async function associateToken(accountId: string, tokenId: string, privateKey: string) {
  const response = await axios.post(`${API_BASE_URL}/nft/account/associate`, {
    accountId,
    tokenId,
    privateKey
  });
  return response.data;
}

async function getAccountBalance(accountId: string, tokenId?: string) {
  const url = tokenId 
    ? `${API_BASE_URL}/nft/balance/${accountId}?tokenId=${tokenId}`
    : `${API_BASE_URL}/nft/balance/${accountId}`;
  const response = await axios.get(url);
  return response.data;
}

async function transferNft(request: any) {
  const response = await axios.post(`${API_BASE_URL}/nft/transfer`, request);
  return response.data;
}

async function burnNft(tokenId: string, serialNumber: number) {
  const response = await axios.post(`${API_BASE_URL}/nft/burn`, {
    tokenId,
    serialNumber
  });
  return response.data;
}

// Exécuter l'exemple si ce fichier est exécuté directement
if (require.main === module) {
  hederaTutorialExample();
}
