import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class TokenService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private client;
    private tokenIdFile;
    private operatorKey;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    createTokenIfNotExists(): Promise<string>;
}
