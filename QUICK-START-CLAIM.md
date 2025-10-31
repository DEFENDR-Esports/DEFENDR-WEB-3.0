# Quick Start - NFT Claim System

## 🎯 Goal
Allow users to claim NFTs with mission data and receive DEFENDR-R tokens as rewards.

---

## Step-by-Step Guide

### 1️⃣ Create DEFENDR-R Token (Do this ONCE)

```bash
curl -X POST http://localhost:3000/token/create-defendr-r
```

**Save the `tokenId` from the response!**

Example response:
```json
{
  "success": true,
  "tokenId": "0.0.4567890",  // ← Save this!
  "transactionId": "...",
  "associated": true,
  "message": "DEFENDR-R token created successfully!"
}
```

---

### 2️⃣ Create a User Account

```bash
curl -X POST http://localhost:3000/nft/account/create \
  -H "Content-Type: application/json" \
  -d '{
    "initialBalance": 10,
    "maxTokenAssociations": 10
  }'
```

**Save ALL three values from the response:**
```json
{
  "accountId": "0.0.6498351",           // ← User's account ID
  "privateKey": "302e020100300506...",  // ← User's private key (IMPORTANT!)
  "publicKey": "302a300506032b657...",
  "status": "SUCCESS"
}
```

> **⚠️ IMPORTANT**: Save the `privateKey`! You'll need it in the next step.

---

### 3️⃣ Associate DEFENDR-R Token with User Account

**CRITICAL**: Use the **USER's private key** from Step 2, NOT the creator's key!

```bash
curl -X POST http://localhost:3000/nft/account/associate \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "0.0.6498351",        // From Step 2
    "tokenId": "0.0.4567890",          // From Step 1
    "privateKey": "302e020100300506..."  // From Step 2 ← USER's private key!
  }'
```

**Success response:**
```json
{
  "status": "SUCCESS",
  "transactionId": "0.0.6498351@1759285629.288163538"
}
```

---

### 4️⃣ Claim NFT and Receive Tokens!

Now the user can claim NFTs and receive DEFENDR-R tokens:

```bash
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "0.0.6498351",      // User account from Step 2
      "name": "John Doe",
      "email": "john@example.com"
    },
    "mission": {
      "id": "mission-001",
      "name": "First Challenge",
      "description": "Complete the first mission",
      "difficulty": "easy",
      "reward": 100,
      "imageUrl": "https://example.com/mission.png"
    },
    "tokenAmount": 100                 // Tokens to transfer
  }'
```

**Success response:**
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
    "tokenId": "0.0.4567890",
    "amount": 100,
    "transactionId": "0.0.123456@1234567890.123456790"
  },
  "message": "NFT claimed successfully and 100 DEFENDR-R tokens transferred"
}
```

---

## 🔑 Private Key Guide

### Which Private Key Do I Use?

| Action | Private Key Needed | Why? |
|--------|-------------------|------|
| Create DEFENDR-R token | Operator/Treasury key (in .env) | You're creating the token |
| Create user account | Operator key (automatic) | You're creating the account |
| **Associate token** | **USER's private key** | **User is accepting the token** |
| Claim NFT | Treasury key (automatic) | Treasury is sending tokens |

### Example Scenario

```javascript
// Step 2 Response - SAVE THESE!
const newUser = {
  accountId: "0.0.6498351",
  privateKey: "302e020100...",  // ← USE THIS in Step 3!
  publicKey: "302a300506..."
}

// Step 3 - Associate token
{
  "accountId": "0.0.6498351",           // User's account
  "tokenId": "0.0.4567890",             // DEFENDR-R token
  "privateKey": "302e020100..."         // User's private key from Step 2
}
```

---

## 🎮 Full Test Script (PowerShell)

Save this as `test-claim-flow.ps1`:

```powershell
Write-Host "🚀 Starting NFT Claim System Test..." -ForegroundColor Cyan

# Step 1: Create DEFENDR-R Token
Write-Host "`n1️⃣ Creating DEFENDR-R token..." -ForegroundColor Yellow
$token = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/token/create-defendr-r"
$tokenId = $token.tokenId
Write-Host "✅ Token created: $tokenId" -ForegroundColor Green

# Step 2: Create User Account
Write-Host "`n2️⃣ Creating user account..." -ForegroundColor Yellow
$userBody = @{
  initialBalance = 10
  maxTokenAssociations = 10
} | ConvertTo-Json

$user = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/nft/account/create" `
  -ContentType "application/json" -Body $userBody
$userAccountId = $user.accountId
$userPrivateKey = $user.privateKey
Write-Host "✅ User created: $userAccountId" -ForegroundColor Green
Write-Host "   Private Key: $($userPrivateKey.Substring(0, 20))..." -ForegroundColor Gray

# Step 3: Associate Token with User Account
Write-Host "`n3️⃣ Associating DEFENDR-R token with user account..." -ForegroundColor Yellow
$associateBody = @{
  accountId = $userAccountId
  tokenId = $tokenId
  privateKey = $userPrivateKey  # ← USER'S private key!
} | ConvertTo-Json

$associate = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/nft/account/associate" `
  -ContentType "application/json" -Body $associateBody
Write-Host "✅ Token associated successfully!" -ForegroundColor Green

# Step 4: Claim NFT
Write-Host "`n4️⃣ Claiming NFT with mission..." -ForegroundColor Yellow
$claimBody = @{
  user = @{
    accountId = $userAccountId
    name = "Test User"
    email = "test@example.com"
  }
  mission = @{
    id = "test-mission-001"
    name = "First Quest"
    description = "Complete the tutorial"
    difficulty = "easy"
    reward = 100
    imageUrl = "https://example.com/quest.png"
  }
  tokenAmount = 100
} | ConvertTo-Json -Depth 3

$claim = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/claim/nft" `
  -ContentType "application/json" -Body $claimBody

Write-Host "✅ NFT claimed successfully!" -ForegroundColor Green
Write-Host "   NFT ID: $($claim.nft.nftId)" -ForegroundColor Cyan
Write-Host "   Tokens received: $($claim.tokenTransfer.amount) DFR" -ForegroundColor Cyan
Write-Host "   NFT Transaction: $($claim.nft.transactionId)" -ForegroundColor Gray
Write-Host "   Token Transaction: $($claim.tokenTransfer.transactionId)" -ForegroundColor Gray

Write-Host "`n🎉 Test completed successfully!" -ForegroundColor Green
```

Run it:
```powershell
.\test-claim-flow.ps1
```

---

## ❌ Common Errors & Solutions

### Error: "TOKEN_NOT_ASSOCIATED_TO_ACCOUNT"

**Problem**: User hasn't associated the token yet

**Solution**: Run Step 3 with the **user's private key**

```bash
# Make sure you use the USER's private key!
curl -X POST http://localhost:3000/nft/account/associate \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "USER_ACCOUNT_ID",
    "tokenId": "DEFENDR_R_TOKEN_ID",
    "privateKey": "USER_PRIVATE_KEY"  // ← Not operator key!
  }'
```

---

### Error: "INVALID_SIGNATURE"

**Problem**: Using wrong private key for association

**Solution**: Use the **account's own private key**, not the creator's key

---

### Error: "DEFENDR-R token ID not found"

**Problem**: Token hasn't been created yet

**Solution**: Run Step 1 to create the token

---

## 🔄 For Each New User

Once you've done Step 1 (create token), for each new user you just need:

```bash
# A. Create account
curl -X POST http://localhost:3000/nft/account/create ...
# → Save accountId and privateKey

# B. Associate token (use user's privateKey!)
curl -X POST http://localhost:3000/nft/account/associate ...
# → Use the privateKey from step A

# C. User can now claim NFTs!
curl -X POST http://localhost:3000/claim/nft ...
```

---

## 📚 See Also

- `SETUP-DEFENDR-R.md` - Detailed setup guide
- `src/claim/TROUBLESHOOTING.md` - Troubleshooting guide
- `src/claim/test-claim-endpoints.http` - HTTP test examples
- `src/token/test-token-endpoints.http` - Token creation examples

