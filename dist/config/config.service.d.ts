import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config, HederaConfig } from './config.interface';
export declare class ConfigService {
    private nestConfigService;
    constructor(nestConfigService: NestConfigService);
    get hedera(): HederaConfig;
    get config(): Config;
}
