import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    generateWallet(): Promise<{
        accountId: string;
        publicKey: string;
        privateKey: string;
        mnemonic: string;
    }>;
    getBalance(accountId: string): Promise<{
        hbars: string;
    }>;
}
