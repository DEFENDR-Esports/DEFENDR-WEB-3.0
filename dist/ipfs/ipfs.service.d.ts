import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export interface IpfsUploadResult {
    cid: string;
    size: number | bigint;
    path: string;
}
export interface IpfsMetadata {
    name: string;
    description?: string;
    image: string;
    attributes?: Record<string, any>;
    created_at: string;
}
export declare class IpfsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private ipfsClient;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private generateFakeCid;
    uploadFile(file: Buffer, filename: string): Promise<IpfsUploadResult>;
    uploadMetadata(metadata: IpfsMetadata): Promise<IpfsUploadResult>;
    getFile(cid: string): Promise<Buffer>;
    getMetadata(cid: string): Promise<IpfsMetadata>;
    uploadImageAndCreateMetadata(imageBuffer: Buffer, filename: string, nftData: {
        name: string;
        description?: string;
        attributes?: Record<string, any>;
    }): Promise<{
        imageCid: string;
        metadataCid: string;
        metadata: IpfsMetadata;
    }>;
    checkConnection(): Promise<boolean>;
    getPublicUrl(cid: string, gateway?: string): string;
    getIpfsUrl(cid: string): string;
}
