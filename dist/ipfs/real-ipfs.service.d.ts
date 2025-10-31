import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export interface IpfsUploadResult {
    cid: string;
    size: number;
    path: string;
}
export interface IpfsMetadata {
    name: string;
    description?: string;
    image: string;
    attributes?: Record<string, any>;
    created_at?: string;
}
export declare class RealIpfsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private ipfs;
    private isConnected;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initPublicService;
    uploadFile(buffer: Buffer, filename: string): Promise<IpfsUploadResult>;
    uploadMetadata(metadata: IpfsMetadata): Promise<IpfsUploadResult>;
    uploadImageAndCreateMetadata(imageBuffer: Buffer, filename: string, nftData: {
        name: string;
        description?: string;
        attributes?: Record<string, any>;
    }): Promise<{
        imageCid: string;
        metadataCid: string;
        metadata: IpfsMetadata;
    }>;
    getFile(cid: string): Promise<Buffer>;
    getMetadata(cid: string): Promise<IpfsMetadata>;
    checkConnection(): Promise<boolean>;
    getPublicUrl(cid: string): string;
    private generateFakeResult;
    private generateFakeCid;
    private generateFakeMetadata;
}
