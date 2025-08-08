export declare class WalletService {
    private client;
    constructor();
    generateWallet(): Promise<{
        accountId: string;
        mnemonic: string;
        privateKey: string;
        publicKey: string;
    }>;
    getBalance(accountId: string): Promise<{
        hbars: string;
    }>;
}
