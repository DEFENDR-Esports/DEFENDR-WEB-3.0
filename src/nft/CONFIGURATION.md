# Configuration du Module NFT

## Variables d'environnement requises

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Réseau Hedera (testnet ou mainnet)
HEDERA_NETWORK=testnet

# ID du compte opérateur (format: 0.0.123456)
OPERATOR_ID=0.0.123456

# Clé privée de l'opérateur (format hex)
OPERATOR_KEY=302e020100300506032b657004220420...

# ID du compte trésorerie (format: 0.0.123456)
TREASURY_ACCOUNT_ID=0.0.123456

# Clé privée pour le supply (format hex)
SUPPLY_PRIVATE_KEY=302e020100300506032b657004220420...

# Clés optionnelles
KYC_PRIVATE_KEY=302e020100300506032b657004220420...
FREEZE_PRIVATE_KEY=302e020100300506032b657004220420...

# Configuration du port (optionnel)
PORT=3000
```

## Obtenir les clés Hedera

1. **Créer un compte sur Hedera** :
   - Allez sur [portal.hedera.com](https://portal.hedera.com)
   - Créez un compte ou connectez-vous

2. **Générer les clés** :
   - Utilisez le portail Hedera pour générer les clés
   - Ou utilisez le SDK Hedera pour générer des clés programmatiquement

3. **Récupérer les IDs** :
   - L'ID du compte est visible dans le portail
   - Les clés privées sont générées lors de la création du compte

## Test de la configuration

Une fois configuré, vous pouvez tester l'API :

```bash
# Démarrer le serveur
npm run start:dev

# Tester le health check
curl http://localhost:3000/nft/health

# Minter un NFT
curl -X POST http://localhost:3000/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test NFT",
    "description": "Un NFT de test",
    "attributes": {"rarity": "common"}
  }'
```

## Sécurité

⚠️ **Important** : Ne jamais commiter les clés privées dans le code source !

- Utilisez des variables d'environnement
- Ajoutez `.env` à votre `.gitignore`
- Utilisez des comptes de test pour le développement
- Rotatez les clés régulièrement en production

