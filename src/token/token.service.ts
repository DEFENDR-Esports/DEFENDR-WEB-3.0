import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  Hbar,
  TokenId,
  TokenAssociateTransaction,
  TokenMintTransaction,
  TransferTransaction,
} from '@hashgraph/sdk';
import * as fs from 'fs';

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);
  private client: Client;
  private tokenIdFile = 'defendr-b.tokenid';
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  constructor(private readonly config: ConfigService) {
    const network = this.config.get<string>('HEDERA_NETWORK') || 'testnet';
    this.operatorId = AccountId.fromString(this.config.get<string>('OPERATOR_ID'));
    const operatorKeyString = this.config.get<string>('OPERATOR_KEY');
    this.operatorKey = PrivateKey.fromString(operatorKeyString);

    this.client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    this.client.setOperator(this.operatorId, this.operatorKey);
  }

  async onModuleInit() {
    const tokenId = await this.createTokenIfNotExists();
    this.logger.log(`DEFENDR-B Token ID: ${tokenId}`);
  }

  async createTokenIfNotExists(): Promise<string> {
    if (fs.existsSync(this.tokenIdFile)) {
      const existingTokenId = fs.readFileSync(this.tokenIdFile, 'utf8');
      this.logger.log(`Token already exists with ID: ${existingTokenId}`);
      return existingTokenId.trim();
    }

    const treasuryIdString = this.config.get<string>('TREASURY_ACCOUNT_ID');
    if (!treasuryIdString) throw new Error('TREASURY_ACCOUNT_ID is not defined');
    const treasuryId = AccountId.fromString(treasuryIdString);

    const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
    if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
    const supplyKey = PrivateKey.fromString(supplyKeyString);

    const kycKeyString = this.config.get<string>('KYC_PRIVATE_KEY');
    const kycKey = kycKeyString ? PrivateKey.fromString(kycKeyString) : undefined;

    const freezeKeyString = this.config.get<string>('FREEZE_PRIVATE_KEY');
    const freezeKey = freezeKeyString ? PrivateKey.fromString(freezeKeyString) : undefined;

    // Choose TokenType: Fungible or NFT
    const tokenType = this.config.get<string>('TOKEN_TYPE') === 'NFT' ? TokenType.NonFungibleUnique : TokenType.FungibleCommon;
    const initialSupply = tokenType === TokenType.FungibleCommon ? 0 : 0;

    const tx = await new TokenCreateTransaction()
      .setTokenName('DEFENDR-B')
      .setTokenSymbol('DFB')
      .setTokenType(tokenType)
      .setDecimals(tokenType === TokenType.FungibleCommon ? 0 : undefined)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .setKycKey(kycKey)
      .setFreezeKey(freezeKey)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(this.client);

    const signedTx = await tx.sign(this.operatorKey);
    const response = await signedTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    const tokenId: TokenId = receipt.tokenId;

    fs.writeFileSync(this.tokenIdFile, tokenId.toString());
    this.logger.log(`Created DEFENDR-B token with ID: ${tokenId}`);
    return tokenId.toString();
  }

  /**
   * Create DEFENDR-R token (fungible reward token)
   */
  async createDefendrRToken(): Promise<{
    tokenId: string;
    transactionId: string;
    associated: boolean;
  }> {
    try {
      const tokenIdFile = 'defendr-r.tokenid';

      // Check if token already exists
      if (fs.existsSync(tokenIdFile)) {
        const existingTokenId = fs.readFileSync(tokenIdFile, 'utf8').trim();
        this.logger.log(`DEFENDR-R token already exists: ${existingTokenId}`);
        return {
          tokenId: existingTokenId,
          transactionId: '',
          associated: true,
        };
      }

      const treasuryIdString = this.config.get<string>('TREASURY_ACCOUNT_ID');
      if (!treasuryIdString) throw new Error('TREASURY_ACCOUNT_ID is not defined');
      const treasuryId = AccountId.fromString(treasuryIdString);

      const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
      if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
      const supplyKey = PrivateKey.fromString(supplyKeyString);

      this.logger.log('Creating DEFENDR-R token...');

      // Create the fungible token
      const createTx = await new TokenCreateTransaction()
        .setTokenName('DEFENDR-R')
        .setTokenSymbol('DFR')
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(1000000) // 1 million tokens initial supply
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey)
        .setMaxTransactionFee(new Hbar(30))
        .freezeWith(this.client);

      const signedCreateTx = await createTx.sign(this.operatorKey);
      const createResponse = await signedCreateTx.execute(this.client);
      const createReceipt = await createResponse.getReceipt(this.client);
      const newTokenId = createReceipt.tokenId;

      // Save token ID to file
      fs.writeFileSync(tokenIdFile, newTokenId.toString());
      this.logger.log(`✅ Created DEFENDR-R token: ${newTokenId}`);

      // Auto-associate token with operator account (treasury)
      let associated = false;
      try {
        this.logger.log(`Associating DEFENDR-R token with treasury account ${treasuryId}...`);
        
        const associateTx = await new TokenAssociateTransaction()
          .setAccountId(treasuryId)
          .setTokenIds([newTokenId])
          .freezeWith(this.client);

        const signedAssociateTx = await associateTx.sign(this.operatorKey);
        const associateResponse = await signedAssociateTx.execute(this.client);
        await associateResponse.getReceipt(this.client);
        
        this.logger.log(`✅ Associated DEFENDR-R token with treasury account`);
        associated = true;
      } catch (associateError) {
        this.logger.warn(
          `Token association skipped (might already be associated): ${associateError.message}`,
        );
        associated = true; // Treasury is automatically associated as it's the treasury
      }

      return {
        tokenId: newTokenId.toString(),
        transactionId: createResponse.transactionId.toString(),
        associated,
      };
    } catch (error) {
      this.logger.error(`Error creating DEFENDR-R token: ${error.message}`);
      throw new Error(`Failed to create DEFENDR-R token: ${error.message}`);
    }
  }

  /**
   * Mint additional DEFENDR-R tokens to treasury
   */
  async mintDefendrRTokens(amount: number): Promise<{
    status: string;
    transactionId: string;
    newTotalSupply: string;
  }> {
    try {
      const tokenIdFile = 'defendr-r.tokenid';
      
      if (!fs.existsSync(tokenIdFile)) {
        throw new Error('DEFENDR-R token does not exist. Create it first.');
      }

      const tokenId = TokenId.fromString(fs.readFileSync(tokenIdFile, 'utf8').trim());
      const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
      if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
      const supplyKey = PrivateKey.fromString(supplyKeyString);

      this.logger.log(`Minting ${amount} DEFENDR-R tokens...`);

      const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const signedMintTx = await mintTx.sign(supplyKey);
      const mintResponse = await signedMintTx.execute(this.client);
      const mintReceipt = await mintResponse.getReceipt(this.client);

      this.logger.log(`✅ Minted ${amount} DEFENDR-R tokens`);

      return {
        status: mintReceipt.status.toString(),
        transactionId: mintResponse.transactionId.toString(),
        newTotalSupply: mintReceipt.totalSupply.toString(),
      };
    } catch (error) {
      this.logger.error(`Error minting DEFENDR-R tokens: ${error.message}`);
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
  }

  /**
   * Associate and send DEFENDR-R tokens to a new account
   * @param accountId - The account ID to send tokens to
   * @param receiverPrivateKey - The private key of the receiver account (needed for association)
   * @param amount - The amount of tokens to send (default: 30)
   */
  async sendDefendrRTokensToNewAccount(
    accountId: string,
    receiverPrivateKey: string,
    amount: number = 30,
  ): Promise<{
    success: boolean;
    associationTxId: string;
    transferTxId: string;
    message: string;
  }> {
    try {
      const tokenIdFile = 'defendr-r.tokenid';
      
      if (!fs.existsSync(tokenIdFile)) {
        throw new Error('DEFENDR-R token does not exist. Create it first.');
      }

      const tokenId = TokenId.fromString(fs.readFileSync(tokenIdFile, 'utf8').trim());
      const receiverId = AccountId.fromString(accountId);
      const receiverKey = PrivateKey.fromString(receiverPrivateKey);
      
      const treasuryIdString = this.config.get<string>('TREASURY_ACCOUNT_ID');
      if (!treasuryIdString) throw new Error('TREASURY_ACCOUNT_ID is not defined');
      const treasuryId = AccountId.fromString(treasuryIdString);

      const treasuryKeyString = this.config.get<string>('OPERATOR_KEY');
      if (!treasuryKeyString) throw new Error('OPERATOR_KEY is not defined');
      const treasuryKey = PrivateKey.fromString(treasuryKeyString);

      this.logger.log(`🔗 Associating DEFENDR-R token with new account ${accountId}...`);

      // Step 1: Associate the token with the new account (requires receiver's signature)
      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(receiverId)
        .setTokenIds([tokenId])
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(this.client);

      const signedAssociateTx = await associateTx.sign(receiverKey);
      const associateResponse = await signedAssociateTx.execute(this.client);
      const associateReceipt = await associateResponse.getReceipt(this.client);
      
      this.logger.log(`✅ Token associated with account ${accountId}`);

      // Step 2: Transfer tokens from treasury to new account
      this.logger.log(`💸 Transferring ${amount} DEFENDR-R tokens to ${accountId}...`);

      const transferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryId, -amount)
        .addTokenTransfer(tokenId, receiverId, amount)
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(this.client);

      const signedTransferTx = await transferTx.sign(treasuryKey);
      const transferResponse = await signedTransferTx.execute(this.client);
      const transferReceipt = await transferResponse.getReceipt(this.client);

      this.logger.log(`✅ Transferred ${amount} DEFENDR-R tokens to ${accountId}`);

      return {
        success: true,
        associationTxId: associateResponse.transactionId.toString(),
        transferTxId: transferResponse.transactionId.toString(),
        message: `Successfully sent ${amount} DEFENDR-R tokens to ${accountId}`,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending DEFENDR-R tokens: ${error.message}`);
      throw new Error(`Failed to send tokens: ${error.message}`);
    }
  }
}
