# DEFENDR WEB 3.0 - API NFT sur Hedera

Une API complète pour la gestion des NFTs sur le réseau Hedera, basée sur le [tutoriel officiel Hedera](https://docs.hedera.com/hedera/tutorials/token/hedera-token-service-part-1-how-to-mint-nfts).

## 🚀 Fonctionnalités

- ✅ **Minting de NFTs** avec nom, description et métadonnées
- ✅ **Upload d'images** et mint automatique
- ✅ **Création de comptes Hedera** programmatique
- ✅ **Tokens NFT avec frais personnalisés**
- ✅ **Minting en batch** (jusqu'à 10 NFTs par transaction)
- ✅ **Transferts de NFTs** avec prix
- ✅ **Association de tokens** aux comptes
- ✅ **Brûlage de NFTs**
- ✅ **Vérification des balances**
- ✅ **Gestion des wallets** et tokens fongibles
- ✅ **Bonus de bienvenue** - 30 tokens DEFENDR-R offerts automatiquement à chaque nouveau wallet

## 🛠️ Installation

1. **Installer les dépendances:**
```bash
npm install
```

2. **Configurer les variables d'environnement:**
Créez un fichier `.env` à la racine du projet:
```env
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.123456
OPERATOR_KEY=302e020100...
TREASURY_ACCOUNT_ID=0.0.123456
TREASURY_PRIVATE_KEY=302e020100...
SUPPLY_PRIVATE_KEY=302e020100...
ADMIN_PRIVATE_KEY=302e020100...
```

3. **Démarrer le serveur:**
```bash
npm run start:dev
```

4. **L'API sera disponible sur** `http://localhost:3000`

## 📚 Documentation

### Documentation complète

- 📖 [Documentation NFT complète](src/nft/README.md)
- 🎁 [Système de bonus de bienvenue](WELCOME-TOKENS.md) - Distribution automatique de tokens
- 🔧 [Configuration DEFENDR-R](SETUP-DEFENDR-R.md)
- ⚡ [Quickstart Claim](QUICK-START-CLAIM.md)

### Endpoints principaux

- **POST** `/nft/mint` - Mint un NFT simple
- **POST** `/nft/mint/with-image` - Upload image + mint NFT
- **POST** `/nft/account/create` - Créer un compte Hedera
- **POST** `/nft/transfer` - Transférer un NFT
- **GET** `/nft/balance/:accountId` - Vérifier le solde

## 🧪 Tests rapides

### Test de démarrage rapide
```bash
npx ts-node src/nft/quick-start.ts
```

### Test d'upload d'image
```bash
npx ts-node src/nft/test-image-upload.ts
```

### Test du tutoriel complet
```bash
npx ts-node src/nft/examples/hedera-tutorial-example.ts
```

## 📁 Structure du projet

```
src/
├── nft/                    # Module NFT complet
│   ├── nft.service.ts     # Service principal NFT
│   ├── nft.controller.ts  # Contrôleur avec tous les endpoints
│   ├── nft.module.ts      # Module NFT
│   ├── examples/          # Exemples d'utilisation
│   └── README.md          # Documentation détaillée
├── wallet/                # Module wallet
├── token/                 # Module token fongible
├── config/                # Configuration
└── redis/                 # Module Redis
```

## 🔧 Scripts disponibles

- `npm run start`: Démarrer l'application
- `npm run start:dev`: Mode développement avec rechargement automatique
- `npm run start:debug`: Mode debug
- `npm run build`: Compiler l'application
- `npm run test`: Lancer les tests
- `npm run lint`: Vérifier le code avec ESLint
- `npm run format`: Formater le code avec Prettier

## 🌐 API Endpoints

### Minting de NFTs
- `POST /nft/mint` - Mint NFT simple
- `POST /nft/mint/with-image` - Upload + mint
- `POST /nft/mint/batch` - Mint en batch

### Gestion des comptes
- `POST /nft/account/create` - Créer compte
- `POST /nft/account/auto-associate` - Auto-association
- `POST /nft/account/associate` - Association manuelle

### Transferts et balances
- `POST /nft/transfer` - Transférer NFT
- `GET /nft/balance/:accountId` - Vérifier solde
- `POST /nft/burn` - Brûler NFT

### Informations
- `GET /nft/info/:nftId` - Infos NFT
- `GET /nft/token/info/:tokenId` - Infos token
- `GET /nft/health` - Statut du service

## 📖 Exemples d'utilisation

Voir les fichiers dans `src/nft/examples/` pour des exemples complets d'utilisation de l'API.

## 🔗 Liens utiles

- [Documentation Hedera](https://docs.hedera.com/)
- [Tutoriel NFT Hedera](https://docs.hedera.com/hedera/tutorials/token/hedera-token-service-part-1-how-to-mint-nfts)
- [SDK Hedera JavaScript](https://github.com/hashgraph/hedera-sdk-js)
