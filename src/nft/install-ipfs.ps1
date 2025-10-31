# Script PowerShell pour installer et configurer IPFS
# Exécutez avec: .\src\nft\install-ipfs.ps1

Write-Host "🚀 Installation d'IPFS pour DEFENDR" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Vérifier si IPFS est déjà installé
Write-Host "1. Vérification d'IPFS..." -ForegroundColor Yellow
try {
    $ipfsVersion = ipfs version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ IPFS déjà installé: $ipfsVersion" -ForegroundColor Green
    } else {
        throw "IPFS non trouvé"
    }
} catch {
    Write-Host "❌ IPFS non installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "2. Installation d'IPFS..." -ForegroundColor Yellow
    
    # Option 1: Via Chocolatey
    try {
        Write-Host "   Tentative d'installation via Chocolatey..." -ForegroundColor Cyan
        choco install ipfs -y
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ IPFS installé via Chocolatey" -ForegroundColor Green
        } else {
            throw "Échec Chocolatey"
        }
    } catch {
        Write-Host "   Chocolatey non disponible" -ForegroundColor Yellow
        
        # Option 2: Téléchargement direct
        Write-Host "   Téléchargement direct d'IPFS..." -ForegroundColor Cyan
        $ipfsUrl = "https://dist.ipfs.io/go-ipfs/v0.24.0/go-ipfs_v0.24.0_windows-amd64.zip"
        $downloadPath = "$env:TEMP\go-ipfs.zip"
        $extractPath = "$env:TEMP\go-ipfs"
        
        Write-Host "   Téléchargement depuis: $ipfsUrl" -ForegroundColor Gray
        Invoke-WebRequest -Uri $ipfsUrl -OutFile $downloadPath
        
        Write-Host "   Extraction..." -ForegroundColor Gray
        Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
        
        Write-Host "   Installation..." -ForegroundColor Gray
        $ipfsExe = Get-ChildItem -Path $extractPath -Recurse -Name "ipfs.exe" | Select-Object -First 1
        if ($ipfsExe) {
            $sourcePath = Join-Path $extractPath $ipfsExe
            $destPath = "C:\Windows\System32\ipfs.exe"
            Copy-Item $sourcePath $destPath -Force
            Write-Host "✅ IPFS installé manuellement" -ForegroundColor Green
        } else {
            throw "Fichier ipfs.exe non trouvé"
        }
    }
}

Write-Host ""
Write-Host "3. Initialisation d'IPFS..." -ForegroundColor Yellow
try {
    # Vérifier si IPFS est déjà initialisé
    $ipfsPath = "$env:USERPROFILE\.ipfs"
    if (Test-Path $ipfsPath) {
        Write-Host "✅ IPFS déjà initialisé" -ForegroundColor Green
    } else {
        Write-Host "   Initialisation..." -ForegroundColor Cyan
        ipfs init
        Write-Host "✅ IPFS initialisé" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur lors de l'initialisation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Démarrage du nœud IPFS..." -ForegroundColor Yellow
Write-Host "   Lancement en arrière-plan..." -ForegroundColor Cyan

# Démarrer IPFS en arrière-plan
$ipfsProcess = Start-Process -FilePath "ipfs" -ArgumentList "daemon" -WindowStyle Hidden -PassThru

if ($ipfsProcess) {
    Write-Host "✅ Nœud IPFS démarré (PID: $($ipfsProcess.Id))" -ForegroundColor Green
    
    # Attendre que le nœud soit prêt
    Write-Host "   Attente du démarrage..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    # Tester la connexion
    try {
        $testResult = ipfs id 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ IPFS prêt et accessible" -ForegroundColor Green
        } else {
            throw "Test échoué"
        }
    } catch {
        Write-Host "⚠️  IPFS démarré mais test de connexion échoué" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Impossible de démarrer IPFS" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Configuration terminée !" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs IPFS:" -ForegroundColor Cyan
Write-Host "   Local: http://localhost:8080/ipfs/" -ForegroundColor Gray
Write-Host "   API:   http://localhost:5001/api/v0/" -ForegroundColor Gray
Write-Host "   Public: https://ipfs.io/ipfs/" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   ipfs id                    # Voir l'ID du nœud" -ForegroundColor Gray
Write-Host "   ipfs daemon               # Démarrer le nœud" -ForegroundColor Gray
Write-Host "   ipfs shutdown            # Arrêter le nœud" -ForegroundColor Gray
Write-Host "   ipfs add fichier.jpg     # Uploader un fichier" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Redémarrez maintenant votre application DEFENDR !" -ForegroundColor Green
Write-Host "   npm run start:dev" -ForegroundColor Yellow


