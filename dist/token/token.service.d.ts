import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class TokenService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private client;
    private tokenIdFile;
    private operatorId;
    private operatorKey;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    createTokenIfNotExists(): Promise<string>;
    createDefendrRToken(): Promise<{
        tokenId: string;
        transactionId: string;
        associated: boolean;
    }>;
    mintDefendrRTokens(amount: number): Promise<{
        status: string;
        transactionId: string;
        newTotalSupply: string;
    }>;
    sendDefendrRTokensToNewAccount(accountId: string, receiverPrivateKey: string, amount?: number): Promise<{
        success: boolean;
        associationTxId: string;
        transferTxId: string;
        message: string;
    }>;
}
