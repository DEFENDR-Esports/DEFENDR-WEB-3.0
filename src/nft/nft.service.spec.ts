import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NftService } from './nft.service';

describe('NftService', () => {
  let service: NftService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have correct configuration', () => {
    expect(configService.get('HEDERA_NETWORK')).toBe('testnet');
    expect(configService.get('OPERATOR_ID')).toBe('0.0.123456');
  });
});

