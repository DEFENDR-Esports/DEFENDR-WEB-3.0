import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { NftMetadataService } from './nft-metadata.service';

@Module({
  imports: [ConfigModule, IpfsModule],
  controllers: [NftController],
  providers: [NftService, NftMetadataService],
  exports: [NftService, NftMetadataService],
})
export class NftModule {}
