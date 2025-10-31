import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api')
  getApiInfo(): object {
    return {
      message: 'API DEFENDR v3.0',
      endpoints: {
        nft: {
          mint: 'POST /nft/mint',
          info: 'GET /nft/info/:nftId',
          health: 'GET /nft/health'
        },
        token: {
          info: 'GET /token'
        },
        wallet: {
          info: 'GET /wallet'
        }
      },
      documentation: 'Voir /nft/README.md pour plus de détails'
    };
  }
}
