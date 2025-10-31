import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { create } from 'ipfs-http-client';

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

@Injectable()
export class RealIpfsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealIpfsService.name);
  private ipfs: any;
  private isConnected = false;

  async onModuleInit() {
    try {
      // Essayer de se connecter à un nœud IPFS local
      this.ipfs = create({ url: 'http://localhost:5001/api/v0' });
      
      // Tester la connexion
      const id = await this.ipfs.id();
      this.isConnected = true;
      this.logger.log(`✅ Connecté à IPFS - ID: ${id.id}`);
    } catch (error) {
      this.logger.warn(`⚠️  Nœud IPFS local non disponible: ${error.message}`);
      this.logger.log('💡 Pour utiliser de vraies images IPFS:');
      this.logger.log('   1. Installez IPFS: https://ipfs.io/docs/install/');
      this.logger.log('   2. Lancez: ipfs daemon');
      this.logger.log('   3. Redémarrez l\'application');
      
      // Fallback vers un service IPFS public
      await this.initPublicService();
    }
  }

  async onModuleDestroy() {
    if (this.ipfs && this.isConnected) {
      this.logger.log('Déconnexion d\'IPFS...');
    }
  }

  private async initPublicService() {
    try {
      // Utiliser un service IPFS public comme fallback
      this.logger.log('🔄 Tentative de connexion à un service IPFS public...');
      
      // Pinata API (nécessite une clé API)
      // this.ipfs = create({
      //   url: 'https://api.pinata.cloud',
      //   headers: {
      //     'pinata_api_key': 'YOUR_API_KEY',
      //     'pinata_secret_api_key': 'YOUR_SECRET_KEY'
      //   }
      // });

      // Pour l'instant, on reste en mode simulé
      this.logger.warn('⚠️  Mode simulé activé - images factices');
      this.isConnected = false;
    } catch (error) {
      this.logger.error(`❌ Impossible de se connecter à IPFS: ${error.message}`);
      this.isConnected = false;
    }
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<IpfsUploadResult> {
    if (!this.isConnected) {
      return this.generateFakeResult(buffer, filename);
    }

    try {
      this.logger.log(`📤 Upload de ${filename} vers IPFS...`);
      
      const result = await this.ipfs.add(buffer, {
        pin: true,
        progress: (prog: number) => {
          this.logger.log(`Upload progress: ${prog}%`);
        }
      });

      this.logger.log(`✅ Upload réussi: ${result.cid}`);
      
      return {
        cid: result.cid.toString(),
        size: result.size,
        path: result.path
      };
    } catch (error) {
      this.logger.error(`❌ Erreur upload IPFS: ${error.message}`);
      return this.generateFakeResult(buffer, filename);
    }
  }

  async uploadMetadata(metadata: IpfsMetadata): Promise<IpfsUploadResult> {
    const metadataJson = JSON.stringify(metadata, null, 2);
    const buffer = Buffer.from(metadataJson, 'utf8');
    
    if (!this.isConnected) {
      return this.generateFakeResult(buffer, 'metadata.json');
    }

    try {
      this.logger.log('📤 Upload des métadonnées vers IPFS...');
      
      const result = await this.ipfs.add(buffer, {
        pin: true
      });

      this.logger.log(`✅ Métadonnées uploadées: ${result.cid}`);
      
      return {
        cid: result.cid.toString(),
        size: result.size,
        path: result.path
      };
    } catch (error) {
      this.logger.error(`❌ Erreur upload métadonnées: ${error.message}`);
      return this.generateFakeResult(buffer, 'metadata.json');
    }
  }

  async uploadImageAndCreateMetadata(
    imageBuffer: Buffer,
    filename: string,
    nftData: {
      name: string;
      description?: string;
      attributes?: Record<string, any>;
    }
  ): Promise<{
    imageCid: string;
    metadataCid: string;
    metadata: IpfsMetadata;
  }> {
    try {
      // Upload de l'image
      const imageResult = await this.uploadFile(imageBuffer, filename);
      
      // Créer les métadonnées
      const metadata: IpfsMetadata = {
        name: nftData.name,
        description: nftData.description || 'Un NFT créé avec DEFENDR',
        image: `ipfs://${imageResult.cid}`,
        attributes: nftData.attributes || {},
        created_at: new Date().toISOString()
      };

      // Upload des métadonnées
      const metadataResult = await this.uploadMetadata(metadata);

      return {
        imageCid: imageResult.cid,
        metadataCid: metadataResult.cid,
        metadata
      };
    } catch (error) {
      this.logger.error(`❌ Erreur upload image + métadonnées: ${error.message}`);
      throw error;
    }
  }

  async getFile(cid: string): Promise<Buffer> {
    if (!this.isConnected) {
      throw new Error('IPFS non connecté - mode simulé');
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`❌ Erreur récupération fichier: ${error.message}`);
      throw error;
    }
  }

  async getMetadata(cid: string): Promise<IpfsMetadata> {
    if (!this.isConnected) {
      return this.generateFakeMetadata();
    }

    try {
      const buffer = await this.getFile(cid);
      const metadata = JSON.parse(buffer.toString('utf8'));
      return metadata;
    } catch (error) {
      this.logger.error(`❌ Erreur récupération métadonnées: ${error.message}`);
      return this.generateFakeMetadata();
    }
  }

  async checkConnection(): Promise<boolean> {
    return this.isConnected;
  }

  getPublicUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`;
  }

  // Méthodes de fallback pour le mode simulé
  private generateFakeResult(buffer: Buffer, filename: string): IpfsUploadResult {
    const fakeCid = this.generateFakeCid();
    this.logger.warn(`⚠️  Mode simulé - CID factice généré: ${fakeCid}`);
    
    return {
      cid: fakeCid,
      size: buffer.length,
      path: filename
    };
  }

  private generateFakeCid(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'Qm';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateFakeMetadata(): IpfsMetadata {
    return {
      name: 'NFT Simulé',
      description: 'Métadonnées simulées - IPFS non connecté',
      image: 'ipfs://QmFakeImageCid',
      attributes: {
        simulated: true,
        ipfs_connected: false
      },
      created_at: new Date().toISOString()
    };
  }
}


