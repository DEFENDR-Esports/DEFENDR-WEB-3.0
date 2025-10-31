#!/bin/bash
# Test simple avec curl pour IPFS
# Exécutez avec: bash src/test-curl-ipfs.sh

API_BASE_URL="http://localhost:3000"

echo "🚀 Test IPFS avec curl..."

# 1. Vérifier la santé d'IPFS
echo "1. Vérification IPFS..."
curl -X GET "$API_BASE_URL/nft/ipfs/health"
echo -e "\n"

# 2. Créer un fichier de test
echo "2. Création fichier de test..."
echo "Hello IPFS from DEFENDR!" > test-curl.txt

# 3. Upload vers IPFS
echo "3. Upload vers IPFS..."
curl -X POST "$API_BASE_URL/nft/upload/ipfs" \
  -F "image=@test-curl.txt"
echo -e "\n"

# 4. Test d'upload d'image et mint NFT
echo "4. Test upload image et mint NFT..."
# Créer une image PNG minimale
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

curl -X POST "$API_BASE_URL/nft/mint/with-image" \
  -F "image=@test-image.png" \
  -F "name=NFT Test Curl" \
  -F "description=Un NFT de test avec curl" \
  -F "attributes={\"rarity\":\"common\",\"test\":true}"
echo -e "\n"

# 5. Nettoyer
rm -f test-curl.txt test-image.png
echo "✅ Test terminé !"





