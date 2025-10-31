import { ConfigService } from '@nestjs/config';
import { NftService } from '../nft/nft.service';
import { TokenService } from '../token/token.service';
export interface ClaimNftRequest {
    user: {
        accountId: string;
        name?: string;
        email?: string;
        privateKey?: string;
    };
    mission: {
        id: string;
        name: string;
        description?: string;
        reward?: number;
        difficulty?: string;
        imageUrl?: string;
    };
    tokenAmount: number;
}
export interface ClaimNftResponse {
    success: boolean;
    nft: {
        nftId: string;
        tokenId: string;
        serialNumber: number;
        transactionId: string;
    };
    tokenTransfer: {
        tokenId: string;
        amount: number;
        transactionId: string;
        autoAssociated?: boolean;
    };
    message: string;
}
export declare class ClaimService {
    private readonly config;
    private readonly nftService;
    private readonly tokenService;
    private readonly logger;
    private client;
    private operatorKey;
    private tokenIdFile;
    private redTokenId;
    constructor(config: ConfigService, nftService: NftService, tokenService: TokenService);
    private loadRedTokenId;
    getRedTokenId(): string;
    isTokenAssociated(accountId: string, tokenId: string): Promise<boolean>;
    autoAssociateTokenForUser(accountId: string, accountPrivateKey: string, tokenId: string): Promise<boolean>;
    transferRedTokens(toAccountId: string, amount: number, userPrivateKey?: string): Promise<{
        status: string;
        transactionId: string;
        autoAssociated: boolean;
    }>;
    claimNftWithMission(request: ClaimNftRequest): Promise<ClaimNftResponse>;
}
