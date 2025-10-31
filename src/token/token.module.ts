import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
  imports: [ConfigModule],
  providers: [TokenService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
