import { Test, TestingModule } from '@nestjs/testing';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('NftController', () => {
  let controller: NftController;
  let service: NftService;

  const mockNftService = {
    mintNft: jest.fn(),
    getNftInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        {
          provide: NftService,
          useValue: mockNftService,
        },
      ],
    }).compile();

    controller = module.get<NftController>(NftController);
    service = module.get<NftService>(NftService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('mintNft', () => {
    it('should mint NFT successfully', async () => {
      const mockRequest = {
        name: 'Test NFT',
        description: 'Un NFT de test',
        image: 'https://example.com/image.png',
        attributes: { rarity: 'common' }
      };

      const mockResponse = {
        nftId: '0.0.123456/1',
        tokenId: '0.0.123456',
        serialNumber: 1,
        transactionId: '0.0.123456@1234567890.123456789'
      };

      mockNftService.mintNft.mockResolvedValue(mockResponse);

      const result = await controller.mintNft(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockNftService.mintNft).toHaveBeenCalledWith(mockRequest);
    });

    it('should throw error for empty name', async () => {
      const mockRequest = {
        name: '',
        description: 'Un NFT de test'
      };

      await expect(controller.mintNft(mockRequest)).rejects.toThrow(HttpException);
    });
  });

  describe('getNftInfo', () => {
    it('should return NFT info successfully', async () => {
      const mockNftId = '0.0.123456/1';
      const mockInfo = {
        nftId: mockNftId,
        tokenId: '0.0.123456',
        serialNumber: 1,
        status: 'minted'
      };

      mockNftService.getNftInfo.mockResolvedValue(mockInfo);

      const result = await controller.getNftInfo(mockNftId);

      expect(result).toEqual(mockInfo);
      expect(mockNftService.getNftInfo).toHaveBeenCalledWith(mockNftId);
    });

    it('should throw error for invalid NFT ID format', async () => {
      const invalidNftId = 'invalid-id';

      await expect(controller.getNftInfo(invalidNftId)).rejects.toThrow(HttpException);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await controller.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        message: 'Service NFT opérationnel'
      });
    });
  });
});

