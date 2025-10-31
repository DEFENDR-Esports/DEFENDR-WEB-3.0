import { IpfsService } from '../ipfs/ipfs.service';
export interface StoredNftMetadata {
    nftId: string;
    imageCid: string;
    metadataCid: string;
    metadata: any;
    createdAt: string;
}
export declare class NftMetadataService {
    private readonly ipfsService;
    private readonly logger;
    private metadataStore;
    constructor(ipfsService: IpfsService);
    storeNftMetadata(nftId: string, imageCid: string, metadataCid: string, metadata: any): Promise<void>;
    getNftMetadata(nftId: string): Promise<StoredNftMetadata | null>;
    getAllStoredMetadata(): Promise<StoredNftMetadata[]>;
    deleteNftMetadata(nftId: string): Promise<boolean>;
    getStats(): {
        totalStored: number;
        nftIds: string[];
    };
}
