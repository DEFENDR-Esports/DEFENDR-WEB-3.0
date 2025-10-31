import { RedisService } from './../redis/redis-subscriber.service';
import { Body, Controller, Get, Param, Post, Logger } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { OnEvent } from "@nestjs/event-emitter"; 
import { CryptoService } from "../crypto/cryptoService";
import { TokenService } from "../token/token.service";

@Controller("wallet")
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly cryptoService: CryptoService, 
    private readonly RedisService: RedisService,
    private readonly tokenService: TokenService
  ) {}
 

  
  @Get(":accountId/balance")
  getBalance(
    @Param("accountId") accountId: string
  ): Promise<{ hbars: string }> {
    return this.walletService.getBalance(accountId);
  }
  @OnEvent("redis.user_created")
  async handleUserCreated(payload: { userId: string; encryptionKey: string }) {
    try {
      this.logger.log(`🎯 User created event received for userId: ${payload.userId}`);
      
      // Step 1: Create wallet
      const walletCreated = await this.walletService.generateWallet();
      this.logger.log(`✅ Wallet created: ${walletCreated.accountId}`);
      
      // Step 2: Send 30 DEFENDR-R tokens to new wallet
      try {
        const tokenResult = await this.tokenService.sendDefendrRTokensToNewAccount(
          walletCreated.accountId,
          walletCreated.privateKey,
          30
        );
        this.logger.log(`🎁 ${tokenResult.message}`);
      } catch (tokenError) {
        this.logger.error(`⚠️ Failed to send welcome tokens: ${tokenError.message}`);
        // Continue wallet creation even if token distribution fails
      }

      // Step 3: Encrypt and store wallet data
      const encryptedMnemonic = this.cryptoService.encryptData(walletCreated.mnemonic, payload.encryptionKey);
      const encryptedPrivateKey = this.cryptoService.encryptData(walletCreated.privateKey, payload.encryptionKey);

      const redisKey = `wallet:${payload.userId}`;
      const redisValue = JSON.stringify({
        accountId: walletCreated.accountId,
        publicKey: walletCreated.publicKey,
        encryptedMnemonic,
        encryptedPrivateKey,
      }); 
    
      await this.RedisService.setKey(redisKey, redisValue, 60 * 60);
      await this.RedisService.publish("wallet_created", payload.userId);
      
      this.logger.log(`✅ Wallet creation completed for userId: ${payload.userId}`);
    } catch (error) {
      this.logger.error(`❌ Error in handleUserCreated: ${error.message}`);
      throw error;
    }
  }
}

