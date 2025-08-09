import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenUpdateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  Hbar,
} from '@hashgraph/sdk';
import * as fs from 'fs';

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);
  private client: Client;
  private tokenIdFile = 'defendr-r.tokenid'; // store token id locally or use DB

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
    this.logger.log(`DEFENDR-R Token ID: ${tokenId}`);

    // Update the memo after creation (or on each startup if you want)
   
  }

  async createTokenIfNotExists(): Promise<string> {
    if (fs.existsSync(this.tokenIdFile)) {
      const existingTokenId = fs.readFileSync(this.tokenIdFile, 'utf8');
      this.logger.log(`Token already created with ID: ${existingTokenId}`);
      return existingTokenId.trim();
    }

    // Prepare treasury and supply keys
    const treasuryIdString = this.config.get<string>('TREASURY_ACCOUNT_ID');
    if (!treasuryIdString) {
      throw new Error('TREASURY_ACCOUNT_ID is not defined in config');
    }
    const treasuryId = AccountId.fromString(treasuryIdString);

    const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
    if (!supplyKeyString) {
      throw new Error('SUPPLY_PRIVATE_KEY is not defined in config');
    }
    const supplyKey = PrivateKey.fromString(supplyKeyString);

    // Create the token
    const tx = await new TokenCreateTransaction()
      .setTokenName('DEFENDR-R')
      .setTokenSymbol('DFR')
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .setMaxTransactionFee(new Hbar(10)) // Set a reasonable max fee
      .freezeWith(this.client);

    // Sign transaction with operator key
    const signedTx = await tx.sign(this.operatorKey);

    // Execute transaction
    const response = await signedTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    const tokenId = receipt.tokenId.toString();

    // Save token id for reuse (to avoid multiple creations)
    fs.writeFileSync(this.tokenIdFile, tokenId);

    this.logger.log(`Created new token with ID: ${tokenId}`);
    return tokenId;
  }

}
