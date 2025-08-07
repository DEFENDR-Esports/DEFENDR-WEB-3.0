import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [ConfigModule, WalletModule, TokenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
