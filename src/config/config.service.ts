import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config, HederaConfig } from './config.interface';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get hedera(): HederaConfig {
    return {
      operatorId: this.nestConfigService.get<string>('OPERATOR_ID'),
      operatorKey: this.nestConfigService.get<string>('OPERATOR_KEY'),
      network: this.nestConfigService.get<'testnet' | 'mainnet' | 'previewnet'>(
        'HEDERA_NETWORK',
        'testnet',
      ),
    };
  }

  get config(): Config {
    return {
      hedera: this.hedera,
    };
  }
}
