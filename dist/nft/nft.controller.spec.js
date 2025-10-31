"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const nft_controller_1 = require("./nft.controller");
const nft_service_1 = require("./nft.service");
const common_1 = require("@nestjs/common");
describe('NftController', () => {
    let controller;
    let service;
    const mockNftService = {
        mintNft: jest.fn(),
        getNftInfo: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [nft_controller_1.NftController],
            providers: [
                {
                    provide: nft_service_1.NftService,
                    useValue: mockNftService,
                },
            ],
        }).compile();
        controller = module.get(nft_controller_1.NftController);
        service = module.get(nft_service_1.NftService);
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
            await expect(controller.mintNft(mockRequest)).rejects.toThrow(common_1.HttpException);
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
            await expect(controller.getNftInfo(invalidNftId)).rejects.toThrow(common_1.HttpException);
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
//# sourceMappingURL=nft.controller.spec.js.map