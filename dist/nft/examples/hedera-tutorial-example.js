"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaTutorialExample = hederaTutorialExample;
const axios_1 = require("axios");
const API_BASE_URL = 'http://localhost:3000';
async function hederaTutorialExample() {
    var _a;
    try {
        console.log('=== TUTORIEL HEDERA NFT - WORKFLOW COMPLET ===\n');
        console.log('1. Création des comptes Alice et Bob...');
        const aliceAccount = await createAccount({ initialBalance: 10, maxTokenAssociations: 10 });
        console.log('Alice créée:', aliceAccount);
        const bobAccount = await createAccount({ initialBalance: 10, maxTokenAssociations: 10 });
        console.log('Bob créé:', bobAccount);
        console.log('\n---\n');
        console.log('2. Création du token NFT "Fall Collection"...');
        const nftToken = await createNftToken({
            tokenName: 'Fall Collection',
            tokenSymbol: 'LEAF',
            maxSupply: 5,
            customFeeAmount: 1000000
        });
        console.log('Token NFT créé:', nftToken);
        console.log('\n---\n');
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
        console.log('4. Informations du token...');
        const tokenInfo = await getTokenInfo(nftToken.tokenId);
        console.log('Infos token:', JSON.stringify(tokenInfo, null, 2));
        console.log('\n---\n');
        console.log('5. Activation auto-association pour Alice...');
        const aliceAutoAssoc = await enableAutoAssociation(aliceAccount.accountId, aliceAccount.privateKey, 10);
        console.log('Auto-association Alice:', aliceAutoAssoc);
        console.log('\n---\n');
        console.log('6. Association manuelle pour Bob...');
        const bobAssoc = await associateToken(bobAccount.accountId, nftToken.tokenId, bobAccount.privateKey);
        console.log('Association Bob:', bobAssoc);
        console.log('\n---\n');
        console.log('7. Vérification des balances initiales...');
        const treasuryBalance = await getAccountBalance('0.0.123456', nftToken.tokenId);
        const aliceBalance = await getAccountBalance(aliceAccount.accountId, nftToken.tokenId);
        const bobBalance = await getAccountBalance(bobAccount.accountId, nftToken.tokenId);
        console.log('Treasury balance:', treasuryBalance);
        console.log('Alice balance:', aliceBalance);
        console.log('Bob balance:', bobBalance);
        console.log('\n---\n');
        console.log('8. Premier transfert : Treasury -> Alice...');
        const transfer1 = await transferNft({
            tokenId: nftToken.tokenId,
            serialNumber: 2,
            fromAccountId: '0.0.123456',
            toAccountId: aliceAccount.accountId,
            fromPrivateKey: 'TREASURY_PRIVATE_KEY'
        });
        console.log('Transfert 1:', transfer1);
        console.log('\n---\n');
        console.log('9. Vérification des balances après transfert 1...');
        const treasuryBalance2 = await getAccountBalance('0.0.123456', nftToken.tokenId);
        const aliceBalance2 = await getAccountBalance(aliceAccount.accountId, nftToken.tokenId);
        const bobBalance2 = await getAccountBalance(bobAccount.accountId, nftToken.tokenId);
        console.log('Treasury balance:', treasuryBalance2);
        console.log('Alice balance:', aliceBalance2);
        console.log('Bob balance:', bobBalance2);
        console.log('\n---\n');
        console.log('10. Deuxième transfert : Alice -> Bob (avec prix)...');
        const transfer2 = await transferNft({
            tokenId: nftToken.tokenId,
            serialNumber: 2,
            fromAccountId: aliceAccount.accountId,
            toAccountId: bobAccount.accountId,
            fromPrivateKey: aliceAccount.privateKey,
            toPrivateKey: bobAccount.privateKey,
            price: 1
        });
        console.log('Transfert 2:', transfer2);
        console.log('\n---\n');
        console.log('11. Vérification des balances finales...');
        const treasuryBalance3 = await getAccountBalance('0.0.123456', nftToken.tokenId);
        const aliceBalance3 = await getAccountBalance(aliceAccount.accountId, nftToken.tokenId);
        const bobBalance3 = await getAccountBalance(bobAccount.accountId, nftToken.tokenId);
        console.log('Treasury balance:', treasuryBalance3);
        console.log('Alice balance:', aliceBalance3);
        console.log('Bob balance:', bobBalance3);
        console.log('\n---\n');
        console.log('12. Brûlage du dernier NFT...');
        const burnResult = await burnNft(nftToken.tokenId, 5);
        console.log('NFT brûlé:', burnResult);
        console.log('\n---\n');
        console.log('13. Vérification du supply final...');
        const finalTokenInfo = await getTokenInfo(nftToken.tokenId);
        console.log('Supply final:', finalTokenInfo.totalSupply);
        console.log('\n=== TUTORIEL TERMINÉ ===');
    }
    catch (error) {
        console.error('Erreur dans le tutoriel:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
async function createAccount(request) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/account/create`, request);
    return response.data;
}
async function createNftToken(request) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/token/create`, request);
    return response.data;
}
async function mintNftBatch(tokenId, cids) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/mint/batch`, {
        tokenId,
        cids
    });
    return response.data;
}
async function getTokenInfo(tokenId) {
    const response = await axios_1.default.get(`${API_BASE_URL}/nft/token/info/${tokenId}`);
    return response.data;
}
async function enableAutoAssociation(accountId, privateKey, maxAssociations) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/account/auto-associate`, {
        accountId,
        privateKey,
        maxAssociations
    });
    return response.data;
}
async function associateToken(accountId, tokenId, privateKey) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/account/associate`, {
        accountId,
        tokenId,
        privateKey
    });
    return response.data;
}
async function getAccountBalance(accountId, tokenId) {
    const url = tokenId
        ? `${API_BASE_URL}/nft/balance/${accountId}?tokenId=${tokenId}`
        : `${API_BASE_URL}/nft/balance/${accountId}`;
    const response = await axios_1.default.get(url);
    return response.data;
}
async function transferNft(request) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/transfer`, request);
    return response.data;
}
async function burnNft(tokenId, serialNumber) {
    const response = await axios_1.default.post(`${API_BASE_URL}/nft/burn`, {
        tokenId,
        serialNumber
    });
    return response.data;
}
if (require.main === module) {
    hederaTutorialExample();
}
//# sourceMappingURL=hedera-tutorial-example.js.map