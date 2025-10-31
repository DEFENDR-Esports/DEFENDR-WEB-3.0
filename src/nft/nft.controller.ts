import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, UseInterceptors, UploadedFile, UseGuards, Logger } from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { NftService, MintNftRequest, MintNftResponse, CreateAccountRequest, CreateAccountResponse, TransferNftRequest, TransferNftResponse, BalanceInfo } from './nft.service';
import { NftMetadataService } from './nft-metadata.service';
import { IpfsService } from '../ipfs/ipfs.service';

@Controller('nft')
export class NftController {
  private readonly logger = new Logger(NftController.name);

  constructor(
    private readonly nftService: NftService,
    private readonly nftMetadataService: NftMetadataService,
    private readonly ipfsService: IpfsService
  ) {}

  @Post('mint')
  async mintNft(@Body() request: MintNftRequest): Promise<MintNftResponse> {
    try {
      if (!request.name || request.name.trim().length === 0) {
        throw new HttpException('Le nom du NFT est requis', HttpStatus.BAD_REQUEST);
      }

      const result = await this.nftService.mintNft(request);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du minting du NFT',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('info/:nftId')
  async getNftInfo(@Param('nftId') nftId: string): Promise<any> {
    try {
      if (!nftId || !nftId.includes('/')) {
        throw new HttpException('Format NFT ID invalide', HttpStatus.BAD_REQUEST);
      }

      const result = await this.nftService.getNftInfo(nftId);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des infos NFT',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; message: string }> {
    return {
      status: 'ok',
      message: 'Service NFT opérationnel'
    };
  }

  // Créer un nouveau compte Hedera
  @Post('account/create')
  async createAccount(@Body() request: CreateAccountRequest): Promise<CreateAccountResponse> {
    try {
      return await this.nftService.createAccount(request);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la création du compte',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Créer un token NFT avec frais personnalisés
  @Post('token/create')
  async createNftToken(@Body() body: {
    tokenName: string;
    tokenSymbol: string;
    maxSupply: number;
    customFeeAmount: number;
  }): Promise<{ tokenId: string }> {
    try {
      const tokenId = await this.nftService.createNftTokenWithCustomFees(
        body.tokenName,
        body.tokenSymbol,
        body.maxSupply,
        body.customFeeAmount
      );
      return { tokenId };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la création du token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Minter plusieurs NFTs en batch
  @Post('mint/batch')
  async mintNftBatch(@Body() body: {
    tokenId: string;
    cids: string[];
  }): Promise<{ status: string; transactionId: string }> {
    try {
      return await this.nftService.mintNftBatch(body.tokenId, body.cids);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du minting batch',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Brûler un NFT
  @Post('burn')
  async burnNft(@Body() body: {
    tokenId: string;
    serialNumber: number;
  }): Promise<{ status: string; transactionId: string }> {
    try {
      return await this.nftService.burnNft(body.tokenId, body.serialNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du burn',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Activer l'auto-association
  @Post('account/auto-associate')
  async enableAutoAssociation(@Body() body: {
    accountId: string;
    privateKey: string;
    maxAssociations?: number;
  }): Promise<{ status: string; transactionId: string }> {
    try {
      return await this.nftService.enableAutoAssociation(
        body.accountId,
        body.privateKey,
        body.maxAssociations || 10
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'auto-association',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Associer manuellement un token
  @Post('account/associate')
  async associateToken(@Body() body: {
    accountId: string;
    tokenId: string;
    privateKey: string;
  }): Promise<{ status: string; transactionId: string }> {
    try {
      return await this.nftService.associateToken(
        body.accountId,
        body.tokenId,
        body.privateKey
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'association',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Vérifier le solde d'un compte
  @Get('balance/:accountId')
  async getAccountBalance(
    @Param('accountId') accountId: string,
    @Param('tokenId') tokenId?: string
  ): Promise<BalanceInfo> {
    try {
      return await this.nftService.getAccountBalance(accountId, tokenId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la vérification du solde',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Transférer un NFT
  @Post('transfer')
  async transferNft(@Body() request: TransferNftRequest): Promise<TransferNftResponse> {
    try {
      return await this.nftService.transferNft(request);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du transfert',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtenir les informations d'un token
  @Get('token/info/:tokenId')
  async getTokenInfo(@Param('tokenId') tokenId: string): Promise<any> {
    try {
      return await this.nftService.getTokenInfo(tokenId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des infos token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Upload d'image vers IPFS et mint NFT
  @Post('mint/with-image')
  @UseInterceptors(FileInterceptor('image', {
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Format de fichier non supporté'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async mintNftWithImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      name: string;
      description?: string;
      attributes?: string; // JSON string
    }
  ): Promise<MintNftResponse & { imageCid: string; metadataCid: string }> {
    try {
      if (!file) {
        throw new HttpException('Aucun fichier image fourni', HttpStatus.BAD_REQUEST);
      }

      // Vérifier que le fichier a un buffer
      if (!file.buffer) {
        throw new HttpException('Buffer du fichier manquant', HttpStatus.BAD_REQUEST);
      }

      // Parser les attributs JSON
      let attributes = {};
      if (body.attributes) {
        try {
          attributes = JSON.parse(body.attributes);
        } catch (error) {
          this.logger.warn('Erreur lors du parsing des attributs JSON:', error);
        }
      }

      // Uploader l'image vers IPFS et mint le NFT
      const result = await this.nftService.mintNftWithImage(
        file.buffer,
        file.originalname,
        {
          name: body.name,
          description: body.description,
          attributes
        }
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du minting avec image IPFS',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Upload simple vers IPFS (sans mint)
  @Post('upload/ipfs')
  @UseInterceptors(FileInterceptor('image', {
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|txt)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Format de fichier non supporté'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  }))
  async uploadToIpfs(
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ cid: string; size: number; path: string; ipfsUrl: string; publicUrl: string }> {
    try {
      if (!file) {
        throw new HttpException('Aucun fichier fourni', HttpStatus.BAD_REQUEST);
      }

      const result = await this.ipfsService.uploadFile(file.buffer, file.originalname);
      
      return {
        cid: result.cid,
        size: Number(result.size),
        path: result.path,
        ipfsUrl: `ipfs://${result.cid}`,
        publicUrl: `https://ipfs.io/ipfs/${result.cid}`
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'upload IPFS',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Vérifier la connectivité IPFS
  @Get('ipfs/health')
  async checkIpfsHealth(): Promise<{ status: string; connected: boolean }> {
    try {
      const connected = await this.ipfsService.checkConnection();
      return {
        status: connected ? 'ok' : 'error',
        connected
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false
      };
    }
  }

  // Récupérer les métadonnées complètes d'un NFT
  @Get('metadata/:nftId')
  async getNftMetadata(@Param('nftId') nftId: string): Promise<any> {
    try {
      if (!nftId || !nftId.includes('/')) {
        throw new HttpException('Format NFT ID invalide', HttpStatus.BAD_REQUEST);
      }

      const result = await this.nftService.getNftMetadata(nftId);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des métadonnées',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Récupérer les métadonnées IPFS d'un NFT
  @Get('ipfs/metadata/:cid')
  async getIpfsMetadata(@Param('cid') cid: string): Promise<any> {
    try {
      const metadata = await this.ipfsService.getMetadata(cid);
      return {
        cid,
        metadata,
        ipfsUrl: `ipfs://${cid}`,
        publicUrl: `https://ipfs.io/ipfs/${cid}`
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des métadonnées IPFS',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Récupérer toutes les métadonnées stockées
  @Get('metadata/all')
  async getAllStoredMetadata(): Promise<any> {
    try {
      const allMetadata = await this.nftMetadataService.getAllStoredMetadata();
      return {
        total: allMetadata.length,
        nfts: allMetadata
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération de toutes les métadonnées',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtenir les statistiques des métadonnées
  @Get('metadata/stats')
  async getMetadataStats(): Promise<any> {
    try {
      const stats = this.nftMetadataService.getStats();
      return stats;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
