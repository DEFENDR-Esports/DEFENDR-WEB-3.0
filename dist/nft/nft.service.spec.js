"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const nft_service_1 = require("./nft.service");
describe('NftService', () => {
    let service;
    let configService;
    const mockConfigService = {
        get: jest.fn((key) => {
            const config = {
                HEDERA_NETWORK: 'testnet',
                OPERATOR_ID: '0.0.123456',
                OPERATOR_KEY: '302e020100300506032b657004220420...',
                TREASURY_ACCOUNT_ID: '0.0.123456',
                SUPPLY_PRIVATE_KEY: '302e020100300506032b657004220420...',
            };
            return config[key];
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                nft_service_1.NftService,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(nft_service_1.NftService);
        configService = module.get(config_1.ConfigService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should have correct configuration', () => {
        expect(configService.get('HEDERA_NETWORK')).toBe('testnet');
        expect(configService.get('OPERATOR_ID')).toBe('0.0.123456');
    });
});
//# sourceMappingURL=nft.service.spec.js.map