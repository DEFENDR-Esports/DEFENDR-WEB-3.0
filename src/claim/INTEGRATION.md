# Guide d'intégration - Module Claim

## 📋 Résumé des modifications

Le module **Claim** a été créé pour gérer la réclamation de NFTs avec missions et le transfert automatique de tokens DEFENDR-R.

## 🆕 Fichiers créés

1. **src/claim/claim.service.ts** (~220 lignes)
   - Service principal pour le claim de NFTs
   - Transfert de tokens DEFENDR-R
   - Gestion des métadonnées de mission

2. **src/claim/claim.controller.ts** (~70 lignes)
   - Endpoint POST /claim/nft
   - Validation des requêtes
   - Gestion des erreurs HTTP

3. **src/claim/claim.module.ts** (~15 lignes)
   - Module NestJS pour le claim
   - Importe NftModule, TokenModule, ConfigModule

4. **src/claim/README.md**
   - Documentation complète du module
   - Exemples d'utilisation
   - Formats de requête/réponse

5. **src/claim/test-claim-endpoints.http**
   - Fichier de tests HTTP
   - 6 exemples de requêtes différentes

## 🔧 Fichiers modifiés

1. **src/token/token.module.ts**
   - Ajout de l'export de TokenService
   - Import de ConfigModule

2. **src/app.module.ts**
   - Ajout de ClaimModule dans les imports

## 🎯 Fonctionnalités

### Endpoint principal: POST /claim/nft

**Corps de la requête:**
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

**Réponse:**
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

## 🔄 Flux d'exécution

1. **Validation** - Vérification des données (user, mission, tokenAmount)
2. **Mint NFT** - Création du NFT avec métadonnées mission/user
3. **Upload IPFS** - Métadonnées stockées sur IPFS
4. **Transfert tokens** - Envoi de DEFENDR-R tokens depuis le treasury
5. **Réponse** - Retour des IDs de transactions

## ⚙️ Configuration requise

### Variables d'environnement
```env
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e020100...
TREASURY_ACCOUNT_ID=0.0.xxxxx
SUPPLY_PRIVATE_KEY=302e020100...
```

### Fichiers de tokens
- `defendr-nft.tokenid` - Token ID pour les NFTs
- `defendr-r.tokenid` - Token ID pour DEFENDR-R (doit exister)

## 🚀 Démarrage

1. **Vérifier la configuration**
   ```bash
   # S'assurer que defendr-r.tokenid existe
   ls defendr-r.tokenid
   ```

2. **Compiler le projet**
   ```bash
   npm run build
   ```

3. **Démarrer le serveur**
   ```bash
   npm run start
   ```

4. **Tester l'endpoint**
   ```bash
   curl -X POST http://localhost:3000/claim/nft \
     -H "Content-Type: application/json" \
     -d '{
       "user": {"accountId": "0.0.123456"},
       "mission": {"id": "test-001", "name": "Test Mission"},
       "tokenAmount": 50
     }'
   ```

## 📊 Métadonnées du NFT

Chaque NFT créé contient:
- **name**: "Mission: [nom de la mission]"
- **description**: Description de la mission
- **attributes**:
  - missionId
  - missionName
  - difficulty
  - reward
  - completedBy (nom ou accountId de l'utilisateur)
  - completedAt (timestamp ISO)
  - userAccountId

## ⚠️ Points d'attention

1. **Association de tokens**
   - L'utilisateur DOIT avoir associé le token DEFENDR-R à son compte
   - Utiliser `/nft/account/associate` si nécessaire

2. **Balance du treasury**
   - S'assurer que le treasury a suffisamment de tokens DEFENDR-R

3. **Gestion des erreurs**
   - Le service lance des exceptions si le mint ou transfert échoue
   - Les erreurs sont loggées pour débogage

## 🧪 Tests

Utiliser le fichier `src/claim/test-claim-endpoints.http` avec REST Client (VS Code):

1. Mission facile (50 tokens)
2. Mission moyenne (150 tokens)
3. Mission difficile (500 tokens)
4. Mission journalière (100 tokens)
5. Mission événement (300 tokens)
6. Mission minimale (25 tokens)

## 📈 Évolutions futures

- [ ] Validation des missions côté backend
- [ ] Système de cooldown pour éviter le spam
- [ ] Support de multiples types de tokens
- [ ] Statistiques de claim par utilisateur
- [ ] Événements Redis pour notifier d'autres services
- [ ] Batch claim (réclamer plusieurs missions d'un coup)

## 🤝 Intégration avec d'autres modules

### NFT Module
- Utilise `NftService.mintNft()` pour créer les NFTs
- Partage le même client Hedera

### Token Module
- Utilise la configuration commune (ConfigModule)
- Peut être étendu pour gérer d'autres types de tokens

### IPFS Module
- Les métadonnées du NFT sont automatiquement uploadées sur IPFS
- Le CID est stocké dans le NFT Hedera

## 📝 Logs

Le service log les informations suivantes:
- Tentatives de claim avec user et mission
- Succès de mint NFT avec CID IPFS
- Transferts de tokens avec montants
- Erreurs détaillées pour débogage

Exemple de logs:
```
[ClaimService] Minting NFT pour mission: Premier Défi
[NftService] Minted NFT: 0.0.789012/1 with name: Mission: Premier Défi
[ClaimService] Transfert de 100 tokens DEFENDR-R vers 0.0.123456
[ClaimService] Transféré 100 tokens DEFENDR-R vers 0.0.123456
[ClaimService] Claim réussi pour l'utilisateur 0.0.123456
```

## 🔗 Ressources

- [Documentation Hedera SDK](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [NestJS Documentation](https://docs.nestjs.com/)
- [IPFS Documentation](https://docs.ipfs.tech/)

