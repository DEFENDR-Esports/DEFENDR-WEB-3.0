import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}
    @Post("generate")
    generateWallet(): Promise<{ accountId: string; publicKey: string; privateKey: string; mnemonic: string; }> {
      return  this.walletService.generateWallet();
    }
    @Get(":accountId/balance")
    getBalance(@Param("accountId") accountId: string): Promise<{ hbars: string; }> {
      return this.walletService.getBalance(accountId);
    } 
}
