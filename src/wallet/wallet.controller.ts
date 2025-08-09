import { RedisService } from './../redis/redis-subscriber.service';
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { OnEvent } from "@nestjs/event-emitter";
import { encryptData } from "../utils";

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService, private readonly RedisService:RedisService) {}
 

  
  @Get(":accountId/balance")
  getBalance(
    @Param("accountId") accountId: string
  ): Promise<{ hbars: string }> {
    return this.walletService.getBalance(accountId);
  }
  @OnEvent("redis.user_created")
  async handleUserCreated(payload: { userId: string; encryptionKey: string }) {
    const walletCreated = await this.walletService.generateWallet();
    console.log("user created event!")
    const encryptedMnemonic = encryptData(walletCreated.mnemonic, payload.encryptionKey);
    const encryptedPrivateKey = encryptData(walletCreated.privateKey, payload.encryptionKey);

    const redisKey = `wallet:${payload.userId}`;
    const redisValue = JSON.stringify({
      accountId: walletCreated.accountId,
      publicKey: walletCreated.publicKey,
      encryptedMnemonic,
      encryptedPrivateKey,
    }); 
  
    await this.RedisService.setKey(redisKey, redisValue, 60 * 60);
    await this.RedisService.publish("wallet_created",payload.userId)
  }
}

