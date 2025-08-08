import { RedisService } from './../redis/redis-subscriber.service';
import { WalletService } from "./wallet.service";
export declare class WalletController {
    private readonly walletService;
    private readonly RedisService;
    constructor(walletService: WalletService, RedisService: RedisService);
    getBalance(accountId: string): Promise<{
        hbars: string;
    }>;
    handleUserCreated(payload: {
        userId: string;
        encryptionKey: string;
    }): Promise<void>;
}
