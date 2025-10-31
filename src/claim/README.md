# Module Claim - DEFENDR

Ce module gère le système de réclamation (claim) de NFTs avec missions et le transfert de tokens DEFENDR-R.

## Fonctionnalités

- ✅ **Claim de NFT** avec informations de mission
- ✅ **Transfert automatique de tokens DEFENDR-R** lors du claim
- ✅ **Métadonnées enrichies** incluant user et mission
- ✅ **Transaction atomique** (NFT + tokens)

## Endpoint Principal

### 🎁 POST /claim/nft

Réclamer un NFT pour une mission complétée et recevoir des tokens DEFENDR-R.

**Body:**
```json
{
  "user": {
    "accountId": "0.0.123456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "mission": {
    "id": "mission-001",
    "name": "Premier Défi",
    "description": "Compléter la première mission",
    "reward": 100,
    "difficulty": "easy"
  },
  "tokenAmount": 100
}
```

**Champs requis:**
- `user.accountId` - L'ID du compte Hedera de l'utilisateur
- `mission.id` - ID unique de la mission
- `mission.name` - Nom de la mission
- `tokenAmount` - Nombre de tokens DEFENDR-R à transférer (doit être > 0)

**Champs optionnels:**
- `user.name` - Nom de l'utilisateur
- `user.email` - Email de l'utilisateur
- `mission.description` - Description de la mission
- `mission.reward` - Récompense de la mission
- `mission.difficulty` - Difficulté (easy, medium, hard)

**Response:**
```json
{
  "success": true,
  "nft": {
    "nftId": "0.0.789012/1",
    "tokenId": "0.0.789012",
    "serialNumber": 1,
    "transactionId": "0.0.123456@1234567890.123456789"
  },
  "tokenTransfer": {
    "tokenId": "0.0.456789",
    "amount": 100,
    "transactionId": "0.0.123456@1234567890.123456790"
  },
  "message": "NFT réclamé avec succès et 100 tokens DEFENDR-R transférés"
}
```

## Exemples d'utilisation

### Exemple 1: Mission facile

```bash
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "0.0.123456",
      "name": "Alice"
    },
    "mission": {
      "id": "easy-001",
      "name": "Introduction",
      "description": "Terminer le tutoriel",
      "difficulty": "easy",
      "reward": 50
    },
    "tokenAmount": 50
  }'
```

### Exemple 2: Mission difficile avec grande récompense

```bash
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "0.0.123456",
      "name": "Bob",
      "email": "bob@defendr.com"
    },
    "mission": {
      "id": "hard-001",
      "name": "Boss Final",
      "description": "Vaincre le boss final",
      "difficulty": "hard",
      "reward": 500
    },
    "tokenAmount": 500
  }'
```

### Exemple 3: Mission journalière

```bash
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "0.0.123456"
    },
    "mission": {
      "id": "daily-2025-10-01",
      "name": "Défi Quotidien",
      "description": "Mission du jour",
      "difficulty": "medium",
      "reward": 100
    },
    "tokenAmount": 100
  }'
```

## Métadonnées du NFT

Chaque NFT créé lors du claim contient les métadonnées suivantes:

```json
{
  "name": "Mission: Premier Défi",
  "description": "Compléter la première mission",
  "attributes": {
    "missionId": "mission-001",
    "missionName": "Premier Défi",
    "difficulty": "easy",
    "reward": 100,
    "completedBy": "John Doe",
    "completedAt": "2025-10-01T12:34:56.789Z",
    "userAccountId": "0.0.123456"
  }
}
```

Ces métadonnées sont stockées sur IPFS et liées au NFT Hedera.

## Health Check

### GET /claim/health

Vérifier le statut du service de claim.

**Response:**
```json
{
  "status": "ok",
  "message": "Service de claim opérationnel"
}
```

## Configuration requise

Avant d'utiliser ce module, assurez-vous d'avoir:

1. **Token DEFENDR-R créé** - Le fichier `defendr-r.tokenid` doit exister
2. **Treasury account configuré** - Dans les variables d'environnement
3. **OPERATOR_KEY** - Pour signer les transactions
4. **NFT token créé** - Le module NFT doit être initialisé

## Flux de travail

1. L'utilisateur complète une mission dans l'application
2. Le backend appelle `/claim/nft` avec les infos user et mission
3. Le service:
   - Mint un NFT avec les métadonnées de la mission
   - Upload les métadonnées vers IPFS
   - Transfère les tokens DEFENDR-R au compte utilisateur
4. Le NFT sert de preuve de complétion de la mission
5. Les tokens peuvent être utilisés dans l'écosystème DEFENDR

## Gestion des erreurs

Le service retourne des erreurs claires:

- `400 Bad Request` - Données manquantes ou invalides
- `500 Internal Server Error` - Erreur lors du mint ou transfert
- Messages d'erreur détaillés pour le débogage

**Exemples d'erreurs:**
- "Account ID de l'utilisateur requis"
- "ID et nom de la mission requis"
- "Le montant de tokens doit être supérieur à 0"
- "DEFENDR-R token ID not found"

## Notes importantes

1. **Association de tokens**: L'utilisateur doit avoir associé le token DEFENDR-R à son compte avant le transfert
2. **Balance suffisante**: Le treasury doit avoir assez de tokens DEFENDR-R
3. **Transactions atomiques**: Si le mint échoue, le transfert n'aura pas lieu
4. **Logs détaillés**: Tous les claims sont loggés pour traçabilité

