#!/bin/bash
# Test de debug avec curl
# Exécutez avec: bash src/test-curl-debug.sh

API_BASE_URL="http://localhost:3000"

echo "🔍 Test de debug avec curl..."

# 1. Vérifier que le serveur répond
echo "1. Test de connectivité..."
curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/nft/health"
echo " - Health check"

# 2. Test IPFS health
echo "2. Test IPFS health..."
curl -X GET "$API_BASE_URL/nft/ipfs/health"
echo ""

# 3. Créer un fichier de test
echo "3. Création fichier de test..."
echo "Test content" > test-debug.txt

# 4. Test upload simple
echo "4. Test upload simple..."
echo "Requête:"
echo "curl -X POST \"$API_BASE_URL/nft/upload/ipfs\" -F \"image=@test-debug.txt\""
echo ""

curl -X POST "$API_BASE_URL/nft/upload/ipfs" \
  -F "image=@test-debug.txt" \
  -v
echo ""

# 5. Test mint NFT
echo "5. Test mint NFT..."
# Créer une image PNG minimale
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

echo "Requête:"
echo "curl -X POST \"$API_BASE_URL/nft/mint/with-image\" -F \"image=@test-image.png\" -F \"name=Test\" -F \"description=Test\" -F \"attributes={\\\"test\\\":true}\""
echo ""

curl -X POST "$API_BASE_URL/nft/mint/with-image" \
  -F "image=@test-image.png" \
  -F "name=Test NFT" \
  -F "description=Test Description" \
  -F "attributes={\"test\":true}" \
  -v
echo ""

# 6. Nettoyer
rm -f test-debug.txt test-image.png
echo "✅ Test de debug terminé"


