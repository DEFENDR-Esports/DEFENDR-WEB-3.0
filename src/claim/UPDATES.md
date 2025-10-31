# Claim Module Updates

## ✅ Changes Applied

### 1. Added Image URL Support
- Added `imageUrl` field to `mission` object in `ClaimNftRequest` interface
- The image URL is now included in the NFT metadata
- Image URL is optional (falls back to empty string if not provided)

### 2. Translated All Comments to English
- All JSDoc comments translated to English
- All inline code comments translated to English
- All log messages translated to English
- All error messages translated to English

## 📝 Updated Request Format

```json
{
  "user": {
    "accountId": "0.0.123456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "mission": {
    "id": "mission-001",
    "name": "First Challenge",
    "description": "Complete the first mission",
    "reward": 100,
    "difficulty": "easy",
    "imageUrl": "https://example.com/images/mission.png"
  },
  "tokenAmount": 100
}
```

## 🔑 Key Features

### Required Fields
- `user.accountId` - User's Hedera account ID
- `mission.id` - Unique mission identifier
- `mission.name` - Mission name
- `tokenAmount` - Amount of DEFENDR-R tokens to transfer (must be > 0)

### Optional Fields
- `user.name` - User's display name
- `user.email` - User's email address
- `mission.description` - Mission description
- `mission.reward` - Mission reward amount
- `mission.difficulty` - Mission difficulty level
- `mission.imageUrl` - URL to mission image ⭐ **NEW**

## 📊 NFT Metadata Structure

The minted NFT will contain:

```json
{
  "name": "Mission: First Challenge",
  "description": "Complete the first mission",
  "image": "https://example.com/images/mission.png",
  "attributes": {
    "missionId": "mission-001",
    "missionName": "First Challenge",
    "difficulty": "easy",
    "reward": 100,
    "completedBy": "John Doe",
    "completedAt": "2025-10-01T12:34:56.789Z",
    "userAccountId": "0.0.123456"
  }
}
```

## 🧪 Test Examples

All test examples in `test-claim-endpoints.http` have been updated to:
- Include `imageUrl` field in mission data
- Use English descriptions and comments
- Show various difficulty levels and rewards

### Example Test Request

```http
POST http://localhost:3000/claim/nft
Content-Type: application/json

{
  "user": {
    "accountId": "0.0.123456",
    "name": "Alice Cooper",
    "email": "alice@defendr.com"
  },
  "mission": {
    "id": "easy-001",
    "name": "Introduction",
    "description": "Complete the introduction tutorial",
    "difficulty": "easy",
    "reward": 50,
    "imageUrl": "https://example.com/images/mission-intro.png"
  },
  "tokenAmount": 50
}
```

## 📂 Files Modified

1. **src/claim/claim.service.ts**
   - Added `imageUrl` to `ClaimNftRequest.mission` interface
   - Translated all comments to English
   - Updated NFT metadata to include image field

2. **src/claim/claim.controller.ts**
   - Translated all JSDoc comments to English
   - Translated error messages to English
   - Translated log messages to English

3. **src/claim/test-claim-endpoints.http**
   - Added `imageUrl` to all test examples
   - Translated descriptions to English
   - Updated mission names and descriptions

## ✨ Benefits

1. **Better NFT Display**: Image URLs make NFTs displayable in wallets and marketplaces
2. **Clearer Code**: English comments make the code accessible to international developers
3. **Consistent API**: All strings use English for consistency across the application
4. **Complete Metadata**: NFTs now have all standard fields (name, description, image, attributes)

## 🚀 Ready to Use

The endpoint is now ready to use with the updated format. Simply:

1. Start your server: `npm run start`
2. Send POST requests to `/claim/nft`
3. Include the `imageUrl` in your mission object
4. Receive NFT with complete metadata including the image

## 📸 Image URL Examples

You can use:
- **Direct URLs**: `https://example.com/images/mission.png`
- **IPFS URLs**: `ipfs://QmHash...` or `https://ipfs.io/ipfs/QmHash...`
- **CDN URLs**: `https://cdn.yourapp.com/missions/001.jpg`
- **Data URLs**: For small images (not recommended for NFTs)

The image URL will be stored in both:
1. The NFT's main `image` field (for wallet display)
2. The IPFS metadata linked to the NFT (permanent record)

