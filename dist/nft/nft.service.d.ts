import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IpfsService } from '../ipfs/ipfs.service';
import { NftMetadataService } from './nft-metadata.service';
export interface MintNftRequest {
    name: string;
    description?: string;
    image?: string;
    attributes?: Record<string, any>;
    cids?: string[];
}
export interface MintNftResponse {
    nftId: string;
    tokenId: string;
    serialNumber: number;
    transactionId: string;
}
export interface CreateAccountRequest {
    initialBalance?: number;
    maxTokenAssociations?: number;
}
export interface CreateAccountResponse {
    accountId: string;
    privateKey: string;
    publicKey: string;
    status: string;
}
export interface TransferNftRequest {
    tokenId: string;
    serialNumber: number;
    fromAccountId: string;
    toAccountId: string;
    fromPrivateKey: string;
    toPrivateKey?: string;
    price?: number;
}
export interface TransferNftResponse {
    status: string;
    transactionId: string;
}
export interface BalanceInfo {
    nftCount: number;
    hbarBalance: string;
    tokenId?: string;
}
export declare class NftService implements OnModuleInit {
    private readonly config;
    private readonly ipfsService;
    private readonly nftMetadataService;
    private readonly logger;
    private client;
    private tokenIdFile;
    private tokenId;
    private operatorKey;
    constructor(config: ConfigService, ipfsService: IpfsService, nftMetadataService: NftMetadataService);
    onModuleInit(): Promise<void>;
    createNftTokenIfNotExists(): Promise<string>;
    mintNft(request: MintNftRequest): Promise<MintNftResponse>;
    mintNftWithImage(imageBuffer: Buffer, filename: string, nftData: {
        name: string;
        description?: string;
        attributes?: Record<string, any>;
    }): Promise<MintNftResponse & {
        imageCid: string;
        metadataCid: string;
    }>;
    getNftInfo(nftId: string): Promise<any>;
    getNftMetadata(nftId: string): Promise<any>;
    createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse>;
    createNftTokenWithCustomFees(tokenName: string, tokenSymbol: string, maxSupply: number, customFeeAmount: number): Promise<string>;
    mintNftBatch(tokenId: string, cids: string[]): Promise<{
        status: string;
        transactionId: string;
    }>;
    burnNft(tokenId: string, serialNumber: number): Promise<{
        status: string;
        transactionId: string;
    }>;
    enableAutoAssociation(accountId: string, privateKey: string, maxAssociations?: number): Promise<{
        status: string;
        transactionId: string;
    }>;
    associateToken(accountId: string, tokenId: string, privateKey: string): Promise<{
        status: string;
        transactionId: string;
    }>;
    getAccountBalance(accountId: string, tokenId?: string): Promise<BalanceInfo>;
    transferNft(request: TransferNftRequest): Promise<TransferNftResponse>;
    getTokenInfo(tokenId: string): Promise<any>;
}
