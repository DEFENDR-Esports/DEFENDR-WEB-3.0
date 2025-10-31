# Troubleshooting Guide - Claim Module

## Common Errors

### ❌ TOKEN_NOT_ASSOCIATED_TO_ACCOUNT

**Error Message:**
```
Error: Token transfer failed: receipt for transaction 0.0.xxx@xxx 
contained error status TOKEN_NOT_ASSOCIATED_TO_ACCOUNT
```

**Cause:**
The user's account has not associated the DEFENDR-R token yet. In Hedera, accounts must explicitly associate a token before they can receive it.

**Solution:**

#### Option 1: Associate the token manually (Recommended for testing)

Use the existing NFT endpoint to associate the token:

```bash
curl -X POST http://localhost:3000/nft/account/associate \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "0.0.123456",
    "tokenId": "0.0.YOUR_DEFENDR_R_TOKEN_ID",
    "privateKey": "302e020100..."
  }'
```

**Where to find the token ID:**
- Check the `defendr-r.tokenid` file in your project root
- Or check the server logs when it starts up

#### Option 2: Enable auto-association (Recommended for production)

Enable auto-association on the user's account (only needs to be done once):

```bash
curl -X POST http://localhost:3000/nft/account/auto-associate \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "0.0.123456",
    "privateKey": "302e020100...",
    "maxAssociations": 100
  }'
```

This allows the account to automatically accept up to 100 different tokens without manual association.

### Example Workflow

**Step 1: Create or get user account**
```bash
POST /nft/account/create
{
  "initialBalance": 10,
  "maxTokenAssociations": 100
}
```

Response will include `accountId` and `privateKey`.

**Step 2: Associate DEFENDR-R token**
```bash
POST /nft/account/associate
{
  "accountId": "0.0.123456",
  "tokenId": "0.0.DEFENDR_R_TOKEN_ID",
  "privateKey": "your-private-key"
}
```

**Step 3: Claim NFT**
```bash
POST /claim/nft
{
  "user": {
    "accountId": "0.0.123456",
    "name": "John Doe"
  },
  "mission": {
    "id": "mission-001",
    "name": "First Mission"
  },
  "tokenAmount": 100
}
```

---

## Other Common Issues

### ❌ INVALID_ACCOUNT_ID

**Error Message:**
```
Error: Invalid account ID format
```

**Solution:**
- Ensure account ID is in format: `0.0.123456`
- No spaces or special characters
- Must be a valid Hedera testnet/mainnet account

---

### ❌ INSUFFICIENT_TOKEN_BALANCE

**Error Message:**
```
Error: Insufficient token balance in treasury
```

**Solution:**
- The treasury account doesn't have enough DEFENDR-R tokens
- Mint more tokens to the treasury account
- Check treasury balance: `GET /nft/balance/{treasuryAccountId}?tokenId={defendrRTokenId}`

---

### ❌ defendr-r.tokenid file not found

**Error Message:**
```
WARN [ClaimService] DEFENDR-R token ID file not found
```

**Solution:**

1. **Create the DEFENDR-R token first:**

You need to create a fungible token for DEFENDR-R. Here's a script to do it:

```typescript
// create-defendr-r-token.ts
import { 
  Client, 
  PrivateKey, 
  AccountId, 
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar
} from '@hashgraph/sdk';
import * as fs from 'fs';

async function createDefendrRToken() {
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  const treasuryId = AccountId.fromString(process.env.TREASURY_ACCOUNT_ID);
  const supplyKey = PrivateKey.fromString(process.env.SUPPLY_PRIVATE_KEY);

  const transaction = await new TokenCreateTransaction()
    .setTokenName('DEFENDR-R')
    .setTokenSymbol('DFR')
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(0)
    .setInitialSupply(1000000) // 1 million tokens
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .setMaxTransactionFee(new Hbar(10))
    .freezeWith(client);

  const signedTx = await transaction.sign(operatorKey);
  const response = await signedTx.execute(client);
  const receipt = await response.getReceipt(client);
  
  const tokenId = receipt.tokenId.toString();
  
  // Save to file
  fs.writeFileSync('defendr-r.tokenid', tokenId);
  
  console.log(`✅ Created DEFENDR-R token: ${tokenId}`);
  console.log(`📝 Saved to: defendr-r.tokenid`);
}

createDefendrRToken().catch(console.error);
```

2. **Run the script:**
```bash
ts-node create-defendr-r-token.ts
```

3. **Verify the file was created:**
```bash
cat defendr-r.tokenid
```

---

## Validation Checklist

Before calling `/claim/nft`, ensure:

- [ ] DEFENDR-R token has been created (`defendr-r.tokenid` file exists)
- [ ] User account exists on Hedera testnet/mainnet
- [ ] User account has associated the DEFENDR-R token (or has auto-association enabled)
- [ ] Treasury account has sufficient DEFENDR-R token balance
- [ ] NFT token has been created (`defendr-nft.tokenid` file exists)
- [ ] All environment variables are set correctly

---

## Quick Test

Test the complete flow with this script:

```bash
# 1. Check DEFENDR-R token ID
cat defendr-r.tokenid

# 2. Create test account
curl -X POST http://localhost:3000/nft/account/create \
  -H "Content-Type: application/json" \
  -d '{"initialBalance": 10, "maxTokenAssociations": 10}'

# Note the accountId and privateKey from response

# 3. Associate DEFENDR-R token
curl -X POST http://localhost:3000/nft/account/associate \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "YOUR_ACCOUNT_ID",
    "tokenId": "YOUR_DEFENDR_R_TOKEN_ID",
    "privateKey": "YOUR_PRIVATE_KEY"
  }'

# 4. Claim NFT
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "YOUR_ACCOUNT_ID",
      "name": "Test User"
    },
    "mission": {
      "id": "test-001",
      "name": "Test Mission",
      "imageUrl": "https://example.com/test.png"
    },
    "tokenAmount": 50
  }'
```

---

## Need Help?

If you're still experiencing issues:

1. Check the server logs for detailed error messages
2. Verify your `.env` configuration
3. Test token association separately: `POST /nft/account/associate`
4. Check account balance: `GET /nft/balance/{accountId}`
5. Verify token info: `GET /nft/token/info/{tokenId}`

