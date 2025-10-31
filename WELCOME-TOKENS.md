# Distribution automatique de Tokens DEFENDR-R lors de la création de wallet

## 🎯 Vue d'ensemble

Lorsqu'un nouveau wallet est créé sur la plateforme DEFENDR, l'utilisateur reçoit automatiquement **30 tokens DEFENDR-R** comme bonus de bienvenue.

## 🔄 Flux de fonctionnement

### 1. Événement de création d'utilisateur
```
redis.user_created → WalletController.handleUserCreated()
```

### 2. Création du wallet
- Génération d'un nouveau compte Hedera
- Création de la mnémonique et des clés privées/publiques
- Balance initiale de 1 HBAR

### 3. Distribution des tokens (NOUVEAU)
Le système effectue automatiquement :
1. **Association du token** : Associe le token DEFENDR-R au nouveau compte
2. **Transfert** : Transfère 30 tokens depuis le Treasury vers le nouveau compte

### 4. Stockage sécurisé
- Chiffrement de la mnémonique et de la clé privée
- Stockage dans Redis avec expiration

## 📋 Détails techniques

### Token DEFENDR-R
- **Type** : Fungible Token (FT)
- **Symbol** : DFR
- **Token ID** : `0.0.6535342` (testnet)
- **Supply Type** : Infini
- **Decimals** : 0

### Montant du bonus
- **Quantité** : 30 tokens DEFENDR-R
- **Configurable** : Peut être modifié dans `wallet.controller.ts` ligne 41

```typescript
await this.tokenService.sendDefendrRTokensToNewAccount(
  walletCreated.accountId,
  walletCreated.privateKey,
  30  // ← Modifiable ici
);
```

## 🔧 Méthodes ajoutées

### TokenService.sendDefendrRTokensToNewAccount()

**Paramètres :**
- `accountId` : L'ID du compte destinataire
- `receiverPrivateKey` : La clé privée du destinataire (nécessaire pour l'association)
- `amount` : Le nombre de tokens à envoyer (par défaut : 30)

**Retourne :**
```typescript
{
  success: boolean;
  associationTxId: string;
  transferTxId: string;
  message: string;
}
```

### Gestion des erreurs

Si la distribution de tokens échoue :
- ⚠️ Un log d'erreur est généré
- ✅ La création du wallet continue normalement
- 📝 L'utilisateur reçoit quand même son wallet

Cela garantit que les problèmes temporaires avec le système de tokens ne bloquent pas la création de comptes.

## 🚀 Prérequis

### Variables d'environnement requises
```env
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e...
TREASURY_ACCOUNT_ID=0.0.xxxxx
SUPPLY_PRIVATE_KEY=302e...
HEDERA_NETWORK=testnet
```

### Token DEFENDR-R doit exister
Créer le token si nécessaire :
```bash
POST http://localhost:3000/token/create-defendr-r
```

### Le Treasury doit avoir suffisamment de tokens
Vérifier ou mint des tokens supplémentaires :
```bash
POST http://localhost:3000/token/mint-defendr-r
Content-Type: application/json

{
  "amount": 10000
}
```

## 📊 Logs et monitoring

### Logs de succès
```
🎯 User created event received for userId: xxx
✅ Wallet created: 0.0.xxxxx
🔗 Associating DEFENDR-R token with new account...
✅ Token associated with account 0.0.xxxxx
💸 Transferring 30 DEFENDR-R tokens to 0.0.xxxxx...
✅ Transferred 30 DEFENDR-R tokens to 0.0.xxxxx
🎁 Successfully sent 30 DEFENDR-R tokens to 0.0.xxxxx
✅ Wallet creation completed for userId: xxx
```

### Logs d'erreur
```
⚠️ Failed to send welcome tokens: [raison de l'erreur]
```

## 🔐 Sécurité

- ✅ La clé privée du nouveau compte est utilisée uniquement pour l'association du token
- ✅ Les clés privées sont chiffrées avant stockage dans Redis
- ✅ Le Treasury signe les transactions de transfert
- ✅ Transactions Hedera vérifiables sur HashScan

## 🧪 Tests

### Test manuel
1. Déclencher un événement `redis.user_created`
2. Vérifier les logs du serveur
3. Consulter le nouveau wallet sur HashScan
4. Vérifier la balance de tokens DEFENDR-R

### Vérification du solde
```bash
GET http://localhost:3000/wallet/0.0.xxxxx/balance
```

## 📝 Notes importantes

1. **Association obligatoire** : Dans Hedera, un compte doit d'abord associer un token avant de pouvoir le recevoir
2. **Signature requise** : L'association nécessite la signature du compte destinataire
3. **Frais de transaction** : Chaque opération (association + transfert) coûte des frais en HBAR
4. **Limite de supply** : Bien que le token ait une supply infinie, le Treasury doit avoir suffisamment de tokens mintés

## 🔄 Évolutions futures possibles

- [ ] Montant de bonus personnalisable par type d'utilisateur
- [ ] Système de parrainage avec bonus supplémentaires
- [ ] Airdrops périodiques pour les utilisateurs actifs
- [ ] Dashboard admin pour gérer les distributions

