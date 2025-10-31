# 🎉 Auto-Association Feature

Now you can claim NFTs + tokens **without manual association!**

## ✨ Just Add `privateKey` to the Request

Simply include the user's `privateKey` in the claim request, and the system will **automatically associate** the DEFENDR-R token if needed!

## 📝 Updated Payload Format

```json
{
  "user": {
    "accountId": "0.0.6932377",
    "name": "web3developer",
    "email": "rosej95981@bitmens.com",
    "privateKey": "302e020100300506032b6570042204203021ce47924141cba9e8e9d61290b0a7d51a852b0ba9645889438206ce625cc0"
  },
  "mission": {
    "id": "68a493732badf5e342053152",
    "name": "5-Day Streak",
    "description": "Logging in for 5 days in a row...",
    "reward": 30,
    "difficulty": "engagement",
    "imageUrl": "https://i.ibb.co/TBf8f82Q/3.png"
  },
  "tokenAmount": 30
}
```

## 🚀 Complete Example

```bash
curl -X POST http://localhost:3000/claim/nft \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "accountId": "0.0.6932377",
      "name": "web3developer",
      "email": "rosej95981@bitmens.com",
      "privateKey": "302e020100300506032b6570042204203021ce47924141cba9e8e9d61290b0a7d51a852b0ba9645889438206ce625cc0"
    },
    "mission": {
      "id": "68a493732badf5e342053152",
      "name": "5-Day Streak",
      "description": "Logging in for 5 days in a row helps you stay consistent and fully engaged with the platform.",
      "reward": 30,
      "difficulty": "engagement",
      "imageUrl": "https://i.ibb.co/TBf8f82Q/3.png"
    },
    "tokenAmount": 30
  }'
```

## ✅ Expected Response

```json
{
  "success": true,
  "nft": {
    "nftId": "0.0.789012/1",
    "tokenId": "0.0.789012",
    "serialNumber": 1,
    "transactionId": "0.0.123456@..."
  },
  "tokenTransfer": {
    "tokenId": "0.0.6535342",
    "amount": 30,
    "transactionId": "0.0.123456@...",
    "autoAssociated": true
  },
  "message": "✅ NFT claimed! Token auto-associated and 30 DEFENDR-R tokens transferred"
}
```

Notice `autoAssociated: true` - this means the system automatically associated the token for you! 🎊

## 🔄 How It Works

1. **Check Association**: System checks if DEFENDR-R token is associated with the user's account
2. **Auto-Associate** (if needed): If not associated AND `privateKey` is provided, the system automatically associates it
3. **Transfer Tokens**: Send the DEFENDR-R tokens to the user
4. **Mint NFT**: Create the mission completion NFT

## 💡 Benefits

- ✅ **One Request**: Everything happens in one API call
- ✅ **No Manual Steps**: No need to call `/nft/account/associate` separately
- ✅ **First-Time Users**: Works perfectly for new users claiming their first reward
- ✅ **Ethereum-Like**: Works like Ethereum - just send tokens!

## 🔒 Security Note

The `privateKey` is only used temporarily during the claim process for token association. It's never stored anywhere.

For production, consider:
- Storing encrypted private keys in your database
- Only sending the private key when needed for association
- Or pre-associating tokens during user registration

## 📊 Without vs With Auto-Association

### ❌ Old Way (Manual)
```bash
# Step 1: Associate token
curl -X POST /nft/account/associate ...

# Step 2: Claim
curl -X POST /claim/nft ...
```

### ✅ New Way (Auto)
```bash
# Just claim! (with privateKey)
curl -X POST /claim/nft ... 
# → Auto-associates if needed!
```

## 🎮 JavaScript Example

```javascript
async function claimMissionReward(user, mission, tokenAmount) {
  const response = await fetch('http://localhost:3000/claim/nft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: {
        accountId: user.hederaAccountId,
        name: user.name,
        email: user.email,
        privateKey: user.hederaPrivateKey // For auto-association
      },
      mission: {
        id: mission.id,
        name: mission.name,
        description: mission.description,
        reward: mission.reward,
        difficulty: mission.difficulty,
        imageUrl: mission.imageUrl
      },
      tokenAmount
    })
  });

  const result = await response.json();
  
  if (result.tokenTransfer.autoAssociated) {
    console.log('✅ Token was auto-associated!');
  }
  
  return result;
}
```

## 🔑 Optional Field

The `user.privateKey` field is **optional**:

- **With privateKey**: Auto-association works ✅
- **Without privateKey**: User must manually associate first ⚠️

Choose based on your use case!

