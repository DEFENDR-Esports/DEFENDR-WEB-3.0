# Module NFT - DEFENDR

Ce module gère le minting et la gestion des NFTs sur le réseau Hedera, basé sur le [tutoriel officiel Hedera](https://docs.hedera.com/hedera/tutorials/token/hedera-token-service-part-1-how-to-mint-nfts).

## Fonctionnalités

- ✅ **Mint de NFTs** avec nom et métadonnées
- ✅ **Upload d'images vers IPFS** et mint automatique
- ✅ **Stockage décentralisé** avec CIDs IPFS
- ✅ **Création de comptes Hedera** programmatique
- ✅ **Tokens NFT avec frais personnalisés**
- ✅ **Minting en batch** (jusqu'à 10 NFTs par transaction)
- ✅ **Transferts de NFTs** avec prix
- ✅ **Association de tokens** aux comptes
- ✅ **Brûlage de NFTs**
- ✅ **Vérification des balances**
- ✅ **Récupération d'informations** sur les tokens
- ✅ **Upload vers IPFS** (fichiers et métadonnées)

## Endpoints

### 🎨 Minting de NFTs

#### POST /nft/mint
Mint un nouveau NFT avec un nom et des métadonnées optionnelles.

**Body:**
```json
{
  "name": "Mon Super NFT",
  "description": "Description du NFT (optionnel)",
  "image": "https://example.com/image.png (optionnel)",
  "attributes": {
    "rarity": "legendary",
    "level": 5
  }
}
```

#### POST /nft/mint/with-image
Upload d'image vers IPFS et mint automatique d'un NFT.

**Form Data:**
- `image`: Fichier image (JPG, PNG, GIF, max 5MB)
- `name`: Nom du NFT
- `description`: Description (optionnel)
- `attributes`: JSON string des attributs (optionnel)

**Response:**
```json
{
  "nftId": "0.0.123456/1",
  "tokenId": "0.0.123456",
  "serialNumber": 1,
  "transactionId": "0.0.123456@1234567890.123456789",
  "imageCid": "QmHashImage...",
  "metadataCid": "QmHashMetadata..."
}
```

#### POST /nft/mint/batch
Minter plusieurs NFTs en batch (jusqu'à 10 par transaction).

**Body:**
```json
{
  "tokenId": "0.0.123456",
  "cids": ["QmHash1...", "QmHash2...", "QmHash3..."]
}
```

### 👥 Gestion des comptes

#### POST /nft/account/create
Créer un nouveau compte Hedera.

**Body:**
```json
{
  "initialBalance": 10,
  "maxTokenAssociations": 10
}
```

#### POST /nft/account/auto-associate
Activer l'auto-association pour un compte.

**Body:**
```json
{
  "accountId": "0.0.123456",
  "privateKey": "302e020100...",
  "maxAssociations": 10
}
```

#### POST /nft/account/associate
Associer manuellement un token à un compte.

**Body:**
```json
{
  "accountId": "0.0.123456",
  "tokenId": "0.0.789012",
  "privateKey": "302e020100..."
}
```

### 🪙 Gestion des tokens

#### POST /nft/token/create
Créer un token NFT avec frais personnalisés.

**Body:**
```json
{
  "tokenName": "Fall Collection",
  "tokenSymbol": "LEAF",
  "maxSupply": 1000,
  "customFeeAmount": 1000000
}
```

#### GET /nft/token/info/:tokenId
Récupérer les informations d'un token.

### 💰 Transferts et balances

#### POST /nft/transfer
Transférer un NFT (avec prix optionnel).

**Body:**
```json
{
  "tokenId": "0.0.123456",
  "serialNumber": 1,
  "fromAccountId": "0.0.111111",
  "toAccountId": "0.0.222222",
  "fromPrivateKey": "302e020100...",
  "toPrivateKey": "302e020100...",
  "price": 1
}
```

#### GET /nft/balance/:accountId
Vérifier le solde d'un compte.

**Query params:**
- `tokenId`: ID du token (optionnel)

### 🌐 IPFS et stockage décentralisé

#### POST /nft/upload/ipfs
Upload simple d'un fichier vers IPFS.

**Form Data:**
- `file`: Fichier à uploader (JPG, PNG, GIF, PDF, TXT, max 10MB)

**Response:**
```json
{
  "cid": "QmHash...",
  "size": 1024,
  "path": "filename.jpg",
  "ipfsUrl": "ipfs://QmHash...",
  "publicUrl": "https://ipfs.io/ipfs/QmHash..."
}
```

#### GET /nft/ipfs/health
Vérifier la connectivité IPFS.

**Response:**
```json
{
  "status": "ok",
  "connected": true
}
```

### 🔥 Autres opérations

#### POST /nft/burn
Brûler un NFT.

**Body:**
```json
{
  "tokenId": "0.0.123456",
  "serialNumber": 1
}
```

#### GET /nft/info/:nftId
Récupérer les informations d'un NFT spécifique.

#### GET /nft/health
Vérifier le statut du service NFT.

## Configuration

Le service nécessite les variables d'environnement suivantes :

- `HEDERA_NETWORK`: testnet ou mainnet
- `OPERATOR_ID`: ID du compte opérateur
- `OPERATOR_KEY`: Clé privée de l'opérateur
- `TREASURY_ACCOUNT_ID`: ID du compte trésorerie
- `SUPPLY_PRIVATE_KEY`: Clé privée pour le supply

## Utilisation

```typescript
import { NftService } from './nft.service';

// Mint un NFT
const nft = await nftService.mintNft({
  name: 'Mon NFT',
  description: 'Description',
  attributes: { rarity: 'common' }
});

// Récupérer les infos
const info = await nftService.getNftInfo('0.0.123456/1');
```
