import { RedisService } from './../redis/redis-subscriber.service';
import { WalletService } from "./wallet.service";
import { CryptoService } from "../crypto/cryptoService";
export declare class WalletController {
    private readonly walletService;
    private readonly cryptoService;
    private readonly RedisService;
    constructor(walletService: WalletService, cryptoService: CryptoService, RedisService: RedisService);
    getBalance(accountId: string): Promise<{
        hbars: string;
    }>;
    handleUserCreated(payload: {
        userId: string;
        encryptionKey: string;
    }): Promise<void>;
}
