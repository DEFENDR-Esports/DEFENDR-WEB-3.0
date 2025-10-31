import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IpfsService, IpfsMetadata } from '../ipfs/ipfs.service';
import { NftMetadataService } from './nft-metadata.service';
import {
  Client,
  PrivateKey,
  TokenMintTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  Hbar,
  TokenId,
  NftId,
  AccountCreateTransaction,
  AccountBalanceQuery,
  TransferTransaction,
  TokenAssociateTransaction,
  AccountUpdateTransaction,
  TokenBurnTransaction,
  TokenInfoQuery,
  CustomFee,
  CustomFixedFee,
  HbarUnit,
} from '@hashgraph/sdk';
import * as fs from 'fs';
import * as path from 'path';

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
  price?: number; // en HBAR
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

@Injectable()
export class NftService implements OnModuleInit {
  private readonly logger = new Logger(NftService.name);
  private client: Client;
  private tokenIdFile = 'defendr-nft.tokenid';
  private tokenId: string;

  private operatorKey: PrivateKey;

  constructor(
    private readonly config: ConfigService,
    private readonly ipfsService: IpfsService,
    private readonly nftMetadataService: NftMetadataService
  ) {
    const network = this.config.get<string>('HEDERA_NETWORK') || 'testnet';
    const operatorId = AccountId.fromString(this.config.get<string>('OPERATOR_ID'));
    const operatorKeyString = this.config.get<string>('OPERATOR_KEY');
    this.operatorKey = PrivateKey.fromString(operatorKeyString);

    this.client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    this.client.setOperator(operatorId, this.operatorKey);
  }

  async onModuleInit() {
    this.tokenId = await this.createNftTokenIfNotExists();
    this.logger.log(`DEFENDR-NFT Token ID: ${this.tokenId}`);
  }

  async createNftTokenIfNotExists(): Promise<string> {
    if (fs.existsSync(this.tokenIdFile)) {
      const existingTokenId = fs.readFileSync(this.tokenIdFile, 'utf8');
      this.logger.log(`NFT Token already exists with ID: ${existingTokenId}`);
      return existingTokenId.trim();
    }

    const treasuryIdString = this.config.get<string>('TREASURY_ACCOUNT_ID');
    if (!treasuryIdString) throw new Error('TREASURY_ACCOUNT_ID is not defined');
    const treasuryId = AccountId.fromString(treasuryIdString);

    const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
    if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
    const supplyKey = PrivateKey.fromString(supplyKeyString);

    const { TokenCreateTransaction, TokenType, TokenSupplyType } = await import('@hashgraph/sdk');

    const tx = await new TokenCreateTransaction()
      .setTokenName('DEFENDR-NFT')
      .setTokenSymbol('DFNFT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(this.client);

    const signedTx = await tx.sign(this.operatorKey);
    const response = await signedTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    const tokenId: TokenId = receipt.tokenId;

    fs.writeFileSync(this.tokenIdFile, tokenId.toString());
    this.logger.log(`Created DEFENDR-NFT token with ID: ${tokenId}`);
    return tokenId.toString();
  }

  async mintNft(request: MintNftRequest): Promise<MintNftResponse> {
    try {
      const tokenId = TokenId.fromString(this.tokenId);
      
      // Créer les métadonnées pour IPFS
      const metadata: IpfsMetadata = {
        name: request.name,
        description: request.description || '',
        image: request.image || '',
        attributes: request.attributes || {},
        created_at: new Date().toISOString()
      };

      // Uploader les métadonnées vers IPFS
      const ipfsResult = await this.ipfsService.uploadMetadata(metadata);
      this.logger.log(`Métadonnées uploadées vers IPFS: ${ipfsResult.cid}`);

      // Utiliser le CID IPFS comme métadonnées pour le NFT
      const metadataBytes = Buffer.from(ipfsResult.cid, 'utf8');

      const tx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .addMetadata(metadataBytes)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const signedTx = await tx.sign(this.operatorKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      const nftId = receipt.serials[0];
      const nftIdString = `${tokenId.toString()}/${nftId}`;

      this.logger.log(`Minted NFT: ${nftIdString} with name: ${request.name}`);
      this.logger.log(`IPFS CID: ${ipfsResult.cid}`);

      return {
        nftId: nftIdString,
        tokenId: tokenId.toString(),
        serialNumber: nftId.toNumber(),
        transactionId: response.transactionId.toString(),
      };
    } catch (error) {
      this.logger.error(`Erreur lors du minting NFT: ${error.message}`);
      throw new Error(`Échec du minting NFT: ${error.message}`);
    }
  }

  // Mint NFT avec upload d'image vers IPFS
  async mintNftWithImage(
    imageBuffer: Buffer,
    filename: string,
    nftData: {
      name: string;
      description?: string;
      attributes?: Record<string, any>;
    }
  ): Promise<MintNftResponse & { imageCid: string; metadataCid: string }> {
    try {
      const tokenId = TokenId.fromString(this.tokenId);
      
      // Uploader l'image et créer les métadonnées via IPFS
      const ipfsResult = await this.ipfsService.uploadImageAndCreateMetadata(
        imageBuffer,
        filename,
        nftData
      );

      this.logger.log(`Image uploadée vers IPFS: ${ipfsResult.imageCid}`);
      this.logger.log(`Métadonnées uploadées vers IPFS: ${ipfsResult.metadataCid}`);

      // Utiliser seulement le CID IPFS comme métadonnées (limite Hedera)
      const metadataBytes = Buffer.from(ipfsResult.metadataCid, 'utf8');

      const tx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .addMetadata(metadataBytes)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const signedTx = await tx.sign(this.operatorKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      const nftId = receipt.serials[0];
      const nftIdString = `${tokenId.toString()}/${nftId}`;

      this.logger.log(`Minted NFT avec image: ${nftIdString}`);
      this.logger.log(`Image IPFS: ipfs://${ipfsResult.imageCid}`);
      this.logger.log(`Métadonnées IPFS: ipfs://${ipfsResult.metadataCid}`);

      // Stocker les métadonnées complètes
      await this.nftMetadataService.storeNftMetadata(
        nftIdString,
        ipfsResult.imageCid,
        ipfsResult.metadataCid,
        ipfsResult.metadata
      );

      return {
        nftId: nftIdString,
        tokenId: tokenId.toString(),
        serialNumber: nftId.toNumber(),
        transactionId: response.transactionId.toString(),
        imageCid: ipfsResult.imageCid,
        metadataCid: ipfsResult.metadataCid
      };
    } catch (error) {
      this.logger.error(`Erreur lors du minting NFT avec image: ${error.message}`);
      throw new Error(`Échec du minting NFT avec image: ${error.message}`);
    }
  }

  async getNftInfo(nftId: string): Promise<any> {
    try {
      const [tokenIdStr, serialNumberStr] = nftId.split('/');
      const tokenId = TokenId.fromString(tokenIdStr);
      const serialNumber = parseInt(serialNumberStr);

      // Note: Pour récupérer les métadonnées complètes, vous devriez utiliser
      // l'API REST de Hedera ou un service de métadonnées
      return {
        nftId,
        tokenId: tokenId.toString(),
        serialNumber,
        status: 'minted'
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des infos NFT: ${error.message}`);
      throw new Error(`Échec de la récupération des infos NFT: ${error.message}`);
    }
  }

  // Récupérer les métadonnées IPFS d'un NFT
  async getNftMetadata(nftId: string): Promise<any> {
    try {
      const storedMetadata = await this.nftMetadataService.getNftMetadata(nftId);
      
      if (!storedMetadata) {
        throw new Error(`Métadonnées non trouvées pour NFT: ${nftId}`);
      }

      return {
        nftId: storedMetadata.nftId,
        imageCid: storedMetadata.imageCid,
        metadataCid: storedMetadata.metadataCid,
        metadata: storedMetadata.metadata,
        createdAt: storedMetadata.createdAt,
        imageUrl: `ipfs://${storedMetadata.imageCid}`,
        imagePublicUrl: `https://ipfs.io/ipfs/${storedMetadata.imageCid}`,
        metadataUrl: `ipfs://${storedMetadata.metadataCid}`,
        metadataPublicUrl: `https://ipfs.io/ipfs/${storedMetadata.metadataCid}`
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des métadonnées NFT: ${error.message}`);
      throw new Error(`Échec de la récupération des métadonnées NFT: ${error.message}`);
    }
  }

  // Create a new Hedera account with AUTO-ASSOCIATION enabled
  // This allows the account to automatically receive tokens (like Ethereum!)
  async createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse> {
    try {
      const initialBalance = new Hbar(request.initialBalance || 0);
      const maxAssociations = request.maxTokenAssociations || 100; // Default 100 for better UX

      // Generate new key pair
      const newPrivateKey = PrivateKey.generateED25519();
      const newPublicKey = newPrivateKey.publicKey;

      const response = await new AccountCreateTransaction()
        .setInitialBalance(initialBalance)
        .setKey(newPublicKey)
        .setMaxAutomaticTokenAssociations(maxAssociations) // ← AUTO-ASSOCIATION enabled!
        .execute(this.client);

      const receipt = await response.getReceipt(this.client);
      const accountId = receipt.accountId;

      this.logger.log(
        `✅ Account created: ${accountId} with auto-association enabled (max ${maxAssociations} tokens)`
      );

      return {
        accountId: accountId.toString(),
        privateKey: newPrivateKey.toString(),
        publicKey: newPublicKey.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      this.logger.error(`Error creating account: ${error.message}`);
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  // Créer un token NFT avec frais personnalisés
  async createNftTokenWithCustomFees(
    tokenName: string,
    tokenSymbol: string,
    maxSupply: number,
    customFeeAmount: number
  ): Promise<string> {
    try {
      const treasuryIdString = this.config.get<string>('TREASURY_ACCOUNT_ID');
      if (!treasuryIdString) throw new Error('TREASURY_ACCOUNT_ID is not defined');
      const treasuryId = AccountId.fromString(treasuryIdString);

      const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
      if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
      const supplyKey = PrivateKey.fromString(supplyKeyString);

      const adminKeyString = this.config.get<string>('ADMIN_PRIVATE_KEY');
      if (!adminKeyString) throw new Error('ADMIN_PRIVATE_KEY is not defined');
      const adminKey = PrivateKey.fromString(adminKeyString);

      const pauseKeyString = this.config.get<string>('PAUSE_PRIVATE_KEY');
      const pauseKey = pauseKeyString ? PrivateKey.fromString(pauseKeyString) : undefined;

      const freezeKeyString = this.config.get<string>('FREEZE_PRIVATE_KEY');
      const freezeKey = freezeKeyString ? PrivateKey.fromString(freezeKeyString) : undefined;

      const wipeKeyString = this.config.get<string>('WIPE_PRIVATE_KEY');
      const wipeKey = wipeKeyString ? PrivateKey.fromString(wipeKeyString) : undefined;

      // Créer un frais personnalisé
      const nftCustomFee = new CustomFixedFee()
        .setFeeCollectorAccountId(treasuryId)
        .setAmount(customFeeAmount);

      const tx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(maxSupply)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminKey.publicKey)
        .setSupplyKey(supplyKey.publicKey)
        .setPauseKey(pauseKey?.publicKey)
        .setFreezeKey(freezeKey?.publicKey)
        .setWipeKey(wipeKey?.publicKey)
        .freezeWith(this.client);

      const signedTx = await tx.sign(PrivateKey.fromString(this.config.get<string>('TREASURY_PRIVATE_KEY')));
      const finalTx = await signedTx.sign(adminKey);
      const response = await finalTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const tokenId = receipt.tokenId;

      this.logger.log(`Token NFT créé avec ID: ${tokenId}`);
      return tokenId.toString();
    } catch (error) {
      this.logger.error(`Erreur lors de la création du token NFT: ${error.message}`);
      throw new Error(`Échec de la création du token NFT: ${error.message}`);
    }
  }

  // Minter plusieurs NFTs en batch
  async mintNftBatch(tokenId: string, cids: string[]): Promise<{ status: string; transactionId: string }> {
    try {
      const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
      if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
      const supplyKey = PrivateKey.fromString(supplyKeyString);

      const tokenIdObj = TokenId.fromString(tokenId);
      const metadataBytes = cids.map(cid => Buffer.from(cid, 'utf8'));

      const tx = await new TokenMintTransaction()
        .setTokenId(tokenIdObj)
        .setMetadata(metadataBytes)
        .freezeWith(this.client);

      const signedTx = await tx.sign(supplyKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      // this.logger.log(`Minté ${cids.length} NFTs pour le token ${tokenId}`);

      return {
        status: receipt.status.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      this.logger.error(`Erreur lors du minting batch: ${error.message}`);
      throw new Error(`Échec du minting batch: ${error.message}`);
    }
  }

  // Brûler un NFT
  async burnNft(tokenId: string, serialNumber: number): Promise<{ status: string; transactionId: string }> {
    try {
      const supplyKeyString = this.config.get<string>('SUPPLY_PRIVATE_KEY');
      if (!supplyKeyString) throw new Error('SUPPLY_PRIVATE_KEY is not defined');
      const supplyKey = PrivateKey.fromString(supplyKeyString);

      const tokenIdObj = TokenId.fromString(tokenId);

      const tx = await new TokenBurnTransaction()
        .setTokenId(tokenIdObj)
        .setSerials([serialNumber])
        .freezeWith(this.client)
        .sign(supplyKey);

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      this.logger.log(`NFT brûlé: ${tokenId}/${serialNumber}`);

      return {
        status: receipt.status.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      this.logger.error(`Erreur lors du burn: ${error.message}`);
      throw new Error(`Échec du burn: ${error.message}`);
    }
  }

  // Associer un token à un compte (auto-association)
  async enableAutoAssociation(accountId: string, privateKey: string, maxAssociations: number = 10): Promise<{ status: string; transactionId: string }> {
    try {
      const accountIdObj = AccountId.fromString(accountId);
      const accountKey = PrivateKey.fromString(privateKey);

      const tx = await new AccountUpdateTransaction()
        .setAccountId(accountIdObj)
        .setMaxAutomaticTokenAssociations(maxAssociations)
        .freezeWith(this.client)
        .sign(accountKey);

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      this.logger.log(`Auto-association activée pour ${accountId}`);

      return {
        status: receipt.status.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'auto-association: ${error.message}`);
      throw new Error(`Échec de l'auto-association: ${error.message}`);
    }
  }

  // Associer manuellement un token à un compte
  async associateToken(accountId: string, tokenId: string, privateKey: string): Promise<{ status: string; transactionId: string }> {
    try {
      const accountIdObj = AccountId.fromString(accountId);
      const tokenIdObj = TokenId.fromString(tokenId);
      const accountKey = PrivateKey.fromString(privateKey);

      const tx = await new TokenAssociateTransaction()
        .setAccountId(accountIdObj)
        .setTokenIds([tokenIdObj])
        .freezeWith(this.client)
        .sign(accountKey);

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      this.logger.log(`Token ${tokenId} associé au compte ${accountId}`);

      return {
        status: receipt.status.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'association: ${error.message}`);
      throw new Error(`Échec de l'association: ${error.message}`);
    }
  }

  // Vérifier le solde d'un compte
  async getAccountBalance(accountId: string, tokenId?: string): Promise<BalanceInfo> {
    try {
      const accountIdObj = AccountId.fromString(accountId);
      const balanceQuery = await new AccountBalanceQuery()
        .setAccountId(accountIdObj)
        .execute(this.client);

      let nftCount = 0;
      if (tokenId) {
        const tokenBalance = balanceQuery.tokens._map.get(tokenId);
        nftCount = tokenBalance ? tokenBalance.toNumber() : 0;
      }

      return {
        nftCount,
        hbarBalance: balanceQuery.hbars.toString(),
        tokenId
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du solde: ${error.message}`);
      throw new Error(`Échec de la vérification du solde: ${error.message}`);
    }
  }

  // Transférer un NFT
  async transferNft(request: TransferNftRequest): Promise<TransferNftResponse> {
    try {
      const tokenId = TokenId.fromString(request.tokenId);
      const fromAccountId = AccountId.fromString(request.fromAccountId);
      const toAccountId = AccountId.fromString(request.toAccountId);
      const fromKey = PrivateKey.fromString(request.fromPrivateKey);

      let tx = new TransferTransaction()
        .addNftTransfer(tokenId, request.serialNumber, fromAccountId, toAccountId);

      // Ajouter un prix si spécifié
      if (request.price) {
        const price = new Hbar(request.price);
        tx = tx
          .addHbarTransfer(fromAccountId, price)
          .addHbarTransfer(toAccountId, price.negated());
      }

      tx = await tx.freezeWith(this.client).sign(fromKey);

      // Signer avec la clé du destinataire si fournie
      if (request.toPrivateKey) {
        const toKey = PrivateKey.fromString(request.toPrivateKey);
        tx = await tx.sign(toKey);
      }

      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      this.logger.log(`NFT transféré: ${request.tokenId}/${request.serialNumber} de ${request.fromAccountId} vers ${request.toAccountId}`);

      return {
        status: receipt.status.toString(),
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      this.logger.error(`Erreur lors du transfert: ${error.message}`);
      throw new Error(`Échec du transfert: ${error.message}`);
    }
  }

  // Obtenir les informations d'un token
  async getTokenInfo(tokenId: string): Promise<any> {
    try {
      const tokenIdObj = TokenId.fromString(tokenId);
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(tokenIdObj)
        .execute(this.client);

      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        maxSupply: tokenInfo.maxSupply,
        treasury: tokenInfo.treasuryAccountId.toString(),
        customFees: tokenInfo.customFees,
        adminKey: tokenInfo.adminKey?.toString(),
        supplyKey: tokenInfo.supplyKey?.toString(),
        freezeKey: tokenInfo.freezeKey?.toString(),
        pauseKey: tokenInfo.pauseKey?.toString(),
        wipeKey: tokenInfo.wipeKey?.toString()
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des infos token: ${error.message}`);
      throw new Error(`Échec de la récupération des infos token: ${error.message}`);
    }
  }
}
