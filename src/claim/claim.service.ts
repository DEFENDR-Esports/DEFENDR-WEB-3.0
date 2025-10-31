import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  TokenId,
  AccountBalanceQuery,
  TokenAssociateTransaction,
} from '@hashgraph/sdk';
import { NftService } from '../nft/nft.service';
import { TokenService } from '../token/token.service';
import * as fs from 'fs';

export interface ClaimNftRequest {
  user: {
    accountId: string;
    name?: string;
    email?: string;
    privateKey?: string; // Optional: for auto-association
  };
  mission: {
    id: string;
    name: string;
    description?: string;
    reward?: number;
    difficulty?: string;
    imageUrl?: string;
  };
  tokenAmount: number; // Amount of DEFENDR-R tokens to transfer
}

export interface ClaimNftResponse {
  success: boolean;
  nft: {
    nftId: string;
    tokenId: string;
    serialNumber: number;
    transactionId: string;
  };
  tokenTransfer: {
    tokenId: string;
    amount: number;
    transactionId: string;
    autoAssociated?: boolean;
  };
  message: string;
}

@Injectable()
export class ClaimService {
  private readonly logger = new Logger(ClaimService.name);
  private client: Client;
  private operatorKey: PrivateKey;
  private tokenIdFile = 'defendr-r.tokenid';
  private redTokenId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly nftService: NftService,
    private readonly tokenService: TokenService,
  ) {
    const network = this.config.get<string>('HEDERA_NETWORK') || 'testnet';
    const operatorId = AccountId.fromString(this.config.get<string>('OPERATOR_ID'));
    const operatorKeyString = this.config.get<string>('OPERATOR_KEY');
    this.operatorKey = PrivateKey.fromString(operatorKeyString);

    this.client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    this.client.setOperator(operatorId, this.operatorKey);

    // Charger le token DEFENDR-R
    this.loadRedTokenId();
  }

  private loadRedTokenId(): void {
    if (fs.existsSync(this.tokenIdFile)) {
      this.redTokenId = fs.readFileSync(this.tokenIdFile, 'utf8').trim();
      this.logger.log(`DEFENDR-R Token ID: ${this.redTokenId}`);
    } else {
      this.logger.warn('DEFENDR-R token ID file not found');
    }
  }

  /**
   * Get the DEFENDR-R token ID
   */
  getRedTokenId(): string {
    if (!this.redTokenId) {
      this.loadRedTokenId();
    }
    return this.redTokenId;
  }

  /**
   * Check if a token is associated with an account
   */
  async isTokenAssociated(
    accountId: string,
    tokenId: string,
  ): Promise<boolean> {
    try {
      const account = AccountId.fromString(accountId);
      const token = TokenId.fromString(tokenId);

      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(account);

      const balance = await balanceQuery.execute(this.client);
      
      // Check if the token exists in the account's token map
      const tokenBalance = balance.tokens.get(token);
      
      return tokenBalance !== null && tokenBalance !== undefined;
    } catch (error) {
      this.logger.error(
        `Error checking token association: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Auto-associate token with an account using treasury key
   * This allows sending tokens without user needing to manually associate
   */
  async autoAssociateTokenForUser(
    accountId: string,
    accountPrivateKey: string,
    tokenId: string,
  ): Promise<boolean> {
    try {
      this.logger.log(
        `Auto-associating token ${tokenId} with account ${accountId}...`,
      );

      const account = AccountId.fromString(accountId);
      const token = TokenId.fromString(tokenId);
      const privateKey = PrivateKey.fromString(accountPrivateKey);

      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(account)
        .setTokenIds([token])
        .freezeWith(this.client);

      const signedTx = await associateTx.sign(privateKey);
      const response = await signedTx.execute(this.client);
      await response.getReceipt(this.client);

      this.logger.log(
        `✅ Auto-associated token ${tokenId} with account ${accountId}`,
      );

      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to auto-associate token: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Transfer DEFENDR-R tokens to a user
   * Now with automatic association if needed!
   */
  async transferRedTokens(
    toAccountId: string,
    amount: number,
    userPrivateKey?: string,
  ): Promise<{ status: string; transactionId: string; autoAssociated: boolean }> {
    try {
      if (!this.redTokenId) {
        throw new Error('DEFENDR-R token ID not found');
      }

      const tokenId = TokenId.fromString(this.redTokenId);
      const treasuryId = AccountId.fromString(
        this.config.get<string>('TREASURY_ACCOUNT_ID'),
      );
      const toAccount = AccountId.fromString(toAccountId);

      // Check if token is associated with the recipient account
      let isAssociated = await this.isTokenAssociated(toAccountId, this.redTokenId);
      let autoAssociated = false;
      
      // If not associated and we have the user's private key, auto-associate it!
      if (!isAssociated && userPrivateKey) {
        this.logger.log(
          `🔄 Token not associated, attempting auto-association...`,
        );
        autoAssociated = await this.autoAssociateTokenForUser(
          toAccountId,
          userPrivateKey,
          this.redTokenId,
        );
        
        if (autoAssociated) {
          isAssociated = true;
          this.logger.log('✅ Auto-association successful!');
        }
      }
      
      if (!isAssociated) {
        this.logger.error(
          `Token ${this.redTokenId} is NOT associated with account ${toAccountId}`
        );
        throw new Error(
          `❌ Token ${this.redTokenId} is NOT associated with account ${toAccountId}.\n\n` +
          `💡 TIP: Pass the user's privateKey in the claim request to enable automatic association!`
        );
      }
 
      // Create transfer transaction
      const tx = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryId, -amount)
        .addTokenTransfer(tokenId, toAccount, amount)
        .freezeWith(this.client);

      // Sign with operator (treasury) key
      const signedTx = await tx.sign(this.operatorKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      this.logger.log(
        `✅ Transferred ${amount} DEFENDR-R tokens to ${toAccountId}`,
      );

      return {
        status: receipt.status.toString(),
        transactionId: response.transactionId.toString(),
        autoAssociated,
      };
    } catch (error) {
      this.logger.error(
        `Error transferring tokens: ${error.message}`,
      );
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }

  /**
   * Claim an NFT with mission data and transfer DEFENDR-R tokens
   */
  async claimNftWithMission(
    request: ClaimNftRequest,
  ): Promise<ClaimNftResponse> {
    try {
      // Validate request
      if (!request.user?.accountId) {
        throw new Error('User account ID is required');
      }

      if (!request.mission?.id || !request.mission?.name) {
        throw new Error('Mission ID and name are required');
      }

      if (request.tokenAmount <= 0) {
        throw new Error('Token amount must be greater than 0');
      }

      // 1. Create NFT with mission metadata
      this.logger.log(
        `Minting NFT for mission: ${request.mission.name}`,
      );

      const nftMetadata = {
        name: `Mission: ${request.mission.name}`,
        description: request.mission.description || 'Mission completed',
        image: request.mission.imageUrl || '',
        attributes: {
          missionId: request.mission.id,
          missionName: request.mission.name,
          difficulty: request.mission.difficulty || 'medium',
          reward: request.mission.reward || request.tokenAmount,
          completedBy: request.user.name || request.user.accountId,
          completedAt: new Date().toISOString(),
          userAccountId: request.user.accountId,
        },
      };

      const nftResult = await this.nftService.mintNft(nftMetadata);

      // 1b. Transfer NFT to user
      this.logger.log(
        `Transferring NFT ${nftResult.nftId} to ${request.user.accountId}`,
      );

      try {
        await this.nftService.transferNft({
          tokenId: nftResult.tokenId,
          serialNumber: nftResult.serialNumber,
          fromAccountId: this.config.get<string>('TREASURY_ACCOUNT_ID'),
          toAccountId: request.user.accountId,
          fromPrivateKey: this.config.get<string>('OPERATOR_KEY'),
          toPrivateKey: request.user.privateKey, // Optional, for receiver signature if needed
        });
        this.logger.log(`✅ NFT transferred to user ${request.user.accountId}`);
      } catch (nftTransferError) {
        this.logger.warn(
          `NFT transfer failed (NFT still in treasury): ${nftTransferError.message}`,
        );
        // Continue anyway - tokens will still be sent
      }

      // 2. Transfer DEFENDR-R tokens to user
      this.logger.log(
        `Transferring ${request.tokenAmount} DEFENDR-R tokens to ${request.user.accountId}`,
      );

      const tokenTransferResult = await this.transferRedTokens(
        request.user.accountId,
        request.tokenAmount,
        request.user.privateKey, // Pass privateKey for auto-association!
      );

      // 3. Return complete response
      const response: ClaimNftResponse = {
        success: true,
        nft: {
          nftId: nftResult.nftId,
          tokenId: nftResult.tokenId,
          serialNumber: nftResult.serialNumber,
          transactionId: nftResult.transactionId,
        },
        tokenTransfer: {
          tokenId: this.redTokenId,
          amount: request.tokenAmount,
          transactionId: tokenTransferResult.transactionId,
          autoAssociated: tokenTransferResult.autoAssociated,
        },
        message: tokenTransferResult.autoAssociated
          ? `✅ NFT claimed! Token auto-associated and ${request.tokenAmount} DEFENDR-R tokens transferred`
          : `✅ NFT claimed and ${request.tokenAmount} DEFENDR-R tokens transferred`,
      };

      this.logger.log(
        `Claim successful for user ${request.user.accountId}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Error during claim: ${error.message}`);
      throw new Error(`Claim failed: ${error.message}`);
    }
  }
}

