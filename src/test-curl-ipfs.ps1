# Test simple avec PowerShell pour IPFS
# Exécutez avec: powershell -ExecutionPolicy Bypass -File src/test-curl-ipfs.ps1

$API_BASE_URL = "http://localhost:3000"

Write-Host "🚀 Test IPFS avec PowerShell..." -ForegroundColor Green

# 1. Vérifier la santé d'IPFS
Write-Host "1. Vérification IPFS..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_BASE_URL/nft/ipfs/health" -Method GET
    Write-Host "✅ IPFS Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur IPFS: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. Créer un fichier de test
Write-Host "2. Création fichier de test..." -ForegroundColor Yellow
"Hello IPFS from DEFENDR!" | Out-File -FilePath "test-curl.txt" -Encoding UTF8
Write-Host "✅ Fichier créé" -ForegroundColor Green
Write-Host ""

# 3. Upload vers IPFS
Write-Host "3. Upload vers IPFS..." -ForegroundColor Yellow
try {
    $form = @{
        image = Get-Item "test-curl.txt"
    }
    $upload = Invoke-RestMethod -Uri "$API_BASE_URL/nft/upload/ipfs" -Method POST -Form $form
    Write-Host "✅ Upload réussi:" -ForegroundColor Green
    Write-Host "   CID: $($upload.cid)" -ForegroundColor Cyan
    Write-Host "   Taille: $($upload.size) bytes" -ForegroundColor Cyan
    Write-Host "   URL IPFS: $($upload.ipfsUrl)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur upload: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Test d'upload d'image et mint NFT
Write-Host "4. Test upload image et mint NFT..." -ForegroundColor Yellow
try {
    # Créer une image PNG minimale
    $pngData = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
    [System.IO.File]::WriteAllBytes("test-image.png", $pngData)
    
    $form = @{
        image = Get-Item "test-image.png"
        name = "NFT Test PowerShell"
        description = "Un NFT de test avec PowerShell"
        attributes = '{"rarity":"common","test":true}'
    }
    $mint = Invoke-RestMethod -Uri "$API_BASE_URL/nft/mint/with-image" -Method POST -Form $form
    Write-Host "✅ NFT minté:" -ForegroundColor Green
    Write-Host "   NFT ID: $($mint.nftId)" -ForegroundColor Cyan
    Write-Host "   Image CID: $($mint.imageCid)" -ForegroundColor Cyan
    Write-Host "   Métadonnées CID: $($mint.metadataCid)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur mint: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Nettoyer
Remove-Item -Path "test-curl.txt" -ErrorAction SilentlyContinue
Remove-Item -Path "test-image.png" -ErrorAction SilentlyContinue
Write-Host "✅ Test terminé !" -ForegroundColor Green





