import { TokenService } from './token.service';
export declare class TokenController {
    private readonly tokenService;
    private readonly logger;
    constructor(tokenService: TokenService);
    createDefendrRToken(): Promise<{
        success: boolean;
        tokenId: string;
        transactionId: string;
        associated: boolean;
        message: string;
    }>;
    mintDefendrRTokens(body: {
        amount: number;
    }): Promise<{
        success: boolean;
        status: string;
        transactionId: string;
        newTotalSupply: string;
        message: string;
    }>;
}
