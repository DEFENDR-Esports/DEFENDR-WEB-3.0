import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller'; 
import { RedisService } from '../redis/redis-subscriber.service';

@Module({
  providers: [WalletService, RedisService],
  controllers: [WalletController]
})
export class WalletModule {}
