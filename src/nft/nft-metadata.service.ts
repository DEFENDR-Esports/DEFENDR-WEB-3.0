import { Injectable, Logger } from '@nestjs/common';
import { IpfsService } from '../ipfs/ipfs.service';

export interface StoredNftMetadata {
  nftId: string;
  imageCid: string;
  metadataCid: string;
  metadata: any;
  createdAt: string;
}

@Injectable()
export class NftMetadataService {
  private readonly logger = new Logger(NftMetadataService.name);
  private metadataStore = new Map<string, StoredNftMetadata>();

  constructor(private readonly ipfsService: IpfsService) {}

  // Stocker les métadonnées d'un NFT
  async storeNftMetadata(
    nftId: string,
    imageCid: string,
    metadataCid: string,
    metadata: any
  ): Promise<void> {
    try {
      const storedMetadata: StoredNftMetadata = {
        nftId,
        imageCid,
        metadataCid,
        metadata,
        createdAt: new Date().toISOString()
      };

      this.metadataStore.set(nftId, storedMetadata);
      this.logger.log(`Métadonnées stockées pour NFT: ${nftId}`);
    } catch (error) {
      this.logger.error(`Erreur lors du stockage des métadonnées: ${error.message}`);
      throw error;
    }
  }

  // Récupérer les métadonnées d'un NFT
  async getNftMetadata(nftId: string): Promise<StoredNftMetadata | null> {
    try {
      const storedMetadata = this.metadataStore.get(nftId);
      
      if (!storedMetadata) {
        this.logger.warn(`Métadonnées non trouvées pour NFT: ${nftId}`);
        return null;
      }

      // Récupérer les métadonnées depuis IPFS
      const ipfsMetadata = await this.ipfsService.getMetadata(storedMetadata.metadataCid);
      
      return {
        ...storedMetadata,
        metadata: ipfsMetadata
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des métadonnées: ${error.message}`);
      throw error;
    }
  }

  // Récupérer toutes les métadonnées stockées
  async getAllStoredMetadata(): Promise<StoredNftMetadata[]> {
    try {
      const allMetadata = Array.from(this.metadataStore.values());
      this.logger.log(`Récupération de ${allMetadata.length} métadonnées stockées`);
      return allMetadata;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de toutes les métadonnées: ${error.message}`);
      throw error;
    }
  }

  // Supprimer les métadonnées d'un NFT
  async deleteNftMetadata(nftId: string): Promise<boolean> {
    try {
      const deleted = this.metadataStore.delete(nftId);
      this.logger.log(`Métadonnées supprimées pour NFT: ${nftId}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression des métadonnées: ${error.message}`);
      throw error;
    }
  }

  // Obtenir les statistiques
  getStats(): { totalStored: number; nftIds: string[] } {
    return {
      totalStored: this.metadataStore.size,
      nftIds: Array.from(this.metadataStore.keys())
    };
  }
}


