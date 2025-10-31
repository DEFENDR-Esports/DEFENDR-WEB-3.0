import { ClaimService, ClaimNftRequest, ClaimNftResponse } from './claim.service';
export declare class ClaimController {
    private readonly claimService;
    private readonly logger;
    constructor(claimService: ClaimService);
    claimNft(request: ClaimNftRequest): Promise<ClaimNftResponse>;
    healthCheck(): Promise<{
        status: string;
        message: string;
    }>;
}
