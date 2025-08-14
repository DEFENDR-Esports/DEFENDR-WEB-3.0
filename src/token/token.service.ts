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
} from '@hashgraph/sdk';
import * as fs from 'fs';

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);
  private client: Client;
  private tokenIdFile = 'defendr-b.tokenid';

  private operatorKey: PrivateKey;

  constructor(private readonly config: ConfigService) {
    const network = this.config.get<string>('HEDERA_NETWORK') || 'testnet';
    const operatorId = AccountId.fromString(this.config.get<string>('OPERATOR_ID'));
    const operatorKeyString = this.config.get<string>('OPERATOR_KEY');
    this.operatorKey = PrivateKey.fromString(operatorKeyString);

    this.client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    this.client.setOperator(operatorId, this.operatorKey);
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
}
