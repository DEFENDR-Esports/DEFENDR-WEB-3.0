import { Module } from '@nestjs/common';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';
import { NftModule } from '../nft/nft.module';
import { TokenModule } from '../token/token.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule, NftModule, TokenModule],
  controllers: [ClaimController],
  providers: [ClaimService],
  exports: [ClaimService],
})
export class ClaimModule {}

