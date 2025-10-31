import { NftService, MintNftRequest, MintNftResponse, CreateAccountRequest, CreateAccountResponse, TransferNftRequest, TransferNftResponse, BalanceInfo } from './nft.service';
import { NftMetadataService } from './nft-metadata.service';
import { IpfsService } from '../ipfs/ipfs.service';
export declare class NftController {
    private readonly nftService;
    private readonly nftMetadataService;
    private readonly ipfsService;
    private readonly logger;
    constructor(nftService: NftService, nftMetadataService: NftMetadataService, ipfsService: IpfsService);
    mintNft(request: MintNftRequest): Promise<MintNftResponse>;
    getNftInfo(nftId: string): Promise<any>;
    healthCheck(): Promise<{
        status: string;
        message: string;
    }>;
    createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse>;
    createNftToken(body: {
        tokenName: string;
        tokenSymbol: string;
        maxSupply: number;
        customFeeAmount: number;
    }): Promise<{
        tokenId: string;
    }>;
    mintNftBatch(body: {
        tokenId: string;
        cids: string[];
    }): Promise<{
        status: string;
        transactionId: string;
    }>;
    burnNft(body: {
        tokenId: string;
        serialNumber: number;
    }): Promise<{
        status: string;
        transactionId: string;
    }>;
    enableAutoAssociation(body: {
        accountId: string;
        privateKey: string;
        maxAssociations?: number;
    }): Promise<{
        status: string;
        transactionId: string;
    }>;
    associateToken(body: {
        accountId: string;
        tokenId: string;
        privateKey: string;
    }): Promise<{
        status: string;
        transactionId: string;
    }>;
    getAccountBalance(accountId: string, tokenId?: string): Promise<BalanceInfo>;
    transferNft(request: TransferNftRequest): Promise<TransferNftResponse>;
    getTokenInfo(tokenId: string): Promise<any>;
    mintNftWithImage(file: Express.Multer.File, body: {
        name: string;
        description?: string;
        attributes?: string;
    }): Promise<MintNftResponse & {
        imageCid: string;
        metadataCid: string;
    }>;
    uploadToIpfs(file: Express.Multer.File): Promise<{
        cid: string;
        size: number;
        path: string;
        ipfsUrl: string;
        publicUrl: string;
    }>;
    checkIpfsHealth(): Promise<{
        status: string;
        connected: boolean;
    }>;
    getNftMetadata(nftId: string): Promise<any>;
    getIpfsMetadata(cid: string): Promise<any>;
    getAllStoredMetadata(): Promise<any>;
    getMetadataStats(): Promise<any>;
}
