# Setup DEFENDR-R Token - Quick Guide

This guide will help you create the DEFENDR-R token needed for the claim system.

## Prerequisites

Make sure your `.env` file has these variables:
```env
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e020100...
TREASURY_ACCOUNT_ID=0.0.xxxxx
SUPPLY_PRIVATE_KEY=302e020100...
```

## Step 1: Create DEFENDR-R Token

Simply call this endpoint:

```bash
curl -X POST http://localhost:3000/token/create-defendr-r
```

**Expected Response:**
```json
{
  "success": true,
  "tokenId": "0.0.123456",
  "transactionId": "0.0.123456@1234567890.123456789",
  "associated": true,
  "message": "DEFENDR-R token created successfully! Token ID: 0.0.123456"
}
```

This will:
- ✅ Create a new fungible token called **DEFENDR-R** (symbol: DFR)
- ✅ Mint **1,000,000** tokens initially to the treasury
- ✅ Save the token ID to `defendr-r.tokenid` file
- ✅ Automatically associate the token with the treasury account

## Step 2: Verify Token Creation

Check that the file was created:

```bash
# Windows PowerShell
Get-Content defendr-r.tokenid

# Windows CMD
type defendr-r.tokenid

# Linux/Mac
cat defendr-r.tokenid
```

You should see something like: `0.0.123456`

## Step 3: Check Token Info

```bash
# Replace TOKEN_ID with the actual token ID from step 1
curl http://localhost:3000/nft/token/info/0.0.TOKEN_ID
```

## Step 4: (Optional) Mint More Tokens

If you need more tokens later:

```bash
curl -X POST http://localhost:3000/token/mint-defendr-r \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000}'
```

This will mint an additional 500,000 tokens to the treasury.

## Step 5: Test the Claim Endpoint

Now you can test claiming an NFT! But first, **the user needs to associate the token**:

### 5a. Create a Test User Account

```bash
curl -X POST http://localhost:3000/nft/account/create \
  -H "Content-Type: application/json" \
  -d '{
    "initialBalance": 10,
    "maxTokenAssociations": 10
  }'
```

Save the `accountId` and `privateKey` from the response.

### 5b. Associate DEFENDR-R Token with User Account

```bash
curl -X POST http://localhost:3000/nft/account/associate \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "USER_ACCOUNT_ID",
    "tokenId": "DEFENDR_R_TOKEN_ID",
    "privateKey": "USER_PRIVATE_KEY"
  }'
```

### 5c. Claim NFT with Rewards

```bash
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "USER_ACCOUNT_ID",
      "name": "Test User"
    },
    "mission": {
      "id": "test-001",
      "name": "Test Mission",
      "description": "Complete the test mission",
      "difficulty": "easy",
      "reward": 100,
      "imageUrl": "https://example.com/mission.png"
    },
    "tokenAmount": 100
  }'
```

**Expected Success Response:**
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
  "message": "NFT claimed successfully and 100 DEFENDR-R tokens transferred"
}
```

## Troubleshooting

### Error: "DEFENDR-R token ID not found"
- Make sure you ran Step 1 successfully
- Check that `defendr-r.tokenid` file exists in project root
- Restart the server to reload the token ID

### Error: "TOKEN_NOT_ASSOCIATED_TO_ACCOUNT"
- The user hasn't associated the token yet
- Follow Step 5b to associate the token with the user's account

### Error: "TREASURY_ACCOUNT_ID is not defined"
- Check your `.env` file has `TREASURY_ACCOUNT_ID` set
- Make sure the account ID format is correct: `0.0.123456`

### Error: "INSUFFICIENT_TOKEN_BALANCE"
- The treasury doesn't have enough tokens
- Use Step 4 to mint more tokens

## Token Details

- **Name**: DEFENDR-R
- **Symbol**: DFR
- **Type**: Fungible Common
- **Decimals**: 0 (no fractional amounts)
- **Supply Type**: Infinite (can mint more anytime)
- **Initial Supply**: 1,000,000 tokens

## Complete Test Script (Windows PowerShell)

```powershell
# 1. Create DEFENDR-R token
$createToken = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/token/create-defendr-r"
Write-Host "✅ Token created: $($createToken.tokenId)"

# 2. Create test user
$user = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/nft/account/create" `
  -ContentType "application/json" `
  -Body '{"initialBalance":10,"maxTokenAssociations":10}'
Write-Host "✅ User created: $($user.accountId)"

# 3. Associate token
$associate = @{
  accountId = $user.accountId
  tokenId = $createToken.tokenId
  privateKey = $user.privateKey
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/nft/account/associate" `
  -ContentType "application/json" `
  -Body $associate
Write-Host "✅ Token associated"

# 4. Claim NFT
$claim = @{
  user = @{
    accountId = $user.accountId
    name = "Test User"
  }
  mission = @{
    id = "test-001"
    name = "Test Mission"
    description = "Complete test"
    difficulty = "easy"
    reward = 100
    imageUrl = "https://example.com/test.png"
  }
  tokenAmount = 100
} | ConvertTo-Json -Depth 3

$result = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/claim/nft" `
  -ContentType "application/json" `
  -Body $claim
Write-Host "✅ NFT claimed! Transaction: $($result.nft.transactionId)"
Write-Host "✅ Tokens transferred: $($result.tokenTransfer.amount) DFR"
```

## Next Steps

After setup is complete:
1. Integrate the claim endpoint into your game/app
2. Set up a system to track mission completions
3. Call `/claim/nft` when users complete missions
4. Users will receive both an NFT and DEFENDR-R tokens as rewards!

