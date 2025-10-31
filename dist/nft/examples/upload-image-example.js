"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageAndMintNft = uploadImageAndMintNft;
exports.uploadRealImageAndMintNft = uploadRealImageAndMintNft;
exports.runExamples = runExamples;
const axios_1 = require("axios");
const form_data_1 = require("form-data");
const fs = require("fs");
const path = require("path");
const API_BASE_URL = 'http://localhost:3000';
async function uploadImageAndMintNft() {
    var _a;
    try {
        console.log('=== UPLOAD IMAGE ET MINT NFT ===\n');
        const testImagePath = './test-image.png';
        await createTestImage(testImagePath);
        const formData = new form_data_1.default();
        formData.append('image', fs.createReadStream(testImagePath));
        formData.append('name', 'Mon Super NFT avec Image');
        formData.append('description', 'Un NFT créé avec une image uploadée');
        formData.append('attributes', JSON.stringify({
            rarity: 'legendary',
            level: 1,
            collection: 'DEFENDR',
            created_by: 'API Upload'
        }));
        console.log('Upload de l\'image et mint du NFT...');
        const response = await axios_1.default.post(`${API_BASE_URL}/nft/mint/with-image`, formData, {
            headers: Object.assign({}, formData.getHeaders()),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log('NFT minté avec succès:');
        console.log(JSON.stringify(response.data, null, 2));
        fs.unlinkSync(testImagePath);
        console.log('\nFichier de test supprimé');
        return response.data;
    }
    catch (error) {
        console.error('Erreur lors de l\'upload et mint:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
async function createTestImage(filePath) {
    const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(filePath, pngData);
    console.log(`Image de test créée: ${filePath}`);
}
async function uploadRealImageAndMintNft(imagePath, nftData) {
    var _a;
    try {
        console.log('=== UPLOAD IMAGE RÉELLE ET MINT NFT ===\n');
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Fichier image non trouvé: ${imagePath}`);
        }
        const ext = path.extname(imagePath).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.');
        }
        const formData = new form_data_1.default();
        formData.append('image', fs.createReadStream(imagePath));
        formData.append('name', nftData.name);
        formData.append('description', nftData.description || '');
        formData.append('attributes', JSON.stringify(nftData.attributes || {}));
        console.log(`Upload de l'image: ${imagePath}`);
        const response = await axios_1.default.post(`${API_BASE_URL}/nft/mint/with-image`, formData, {
            headers: Object.assign({}, formData.getHeaders()),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log('NFT minté avec succès:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    }
    catch (error) {
        console.error('Erreur lors de l\'upload et mint:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
async function runExamples() {
    try {
        console.log('=== EXEMPLES D\'UPLOAD ET MINT NFT ===\n');
        console.log('1. Test avec image factice...');
        await uploadImageAndMintNft();
        console.log('\n---\n');
        const realImagePath = './my-image.jpg';
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
        }
        else {
            console.log('2. Pas d\'image réelle trouvée, skip...');
        }
        console.log('\n=== EXEMPLES TERMINÉS ===');
    }
    catch (error) {
        console.error('Erreur dans les exemples:', error);
    }
}
if (require.main === module) {
    runExamples();
}
//# sourceMappingURL=upload-image-example.js.map