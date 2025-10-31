import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller'; 
import { RedisService } from '../redis/redis-subscriber.service';
import { CryptoService } from '../crypto/cryptoService';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TokenModule],
  providers: [WalletService, RedisService, CryptoService],
  controllers: [WalletController]
})
export class WalletModule {}
