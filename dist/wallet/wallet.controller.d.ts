import { RedisService } from './../redis/redis-subscriber.service';
import { WalletService } from "./wallet.service";
import { CryptoService } from "../crypto/cryptoService";
import { TokenService } from "../token/token.service";
export declare class WalletController {
    private readonly walletService;
    private readonly cryptoService;
    private readonly RedisService;
    private readonly tokenService;
    private readonly logger;
    constructor(walletService: WalletService, cryptoService: CryptoService, RedisService: RedisService, tokenService: TokenService);
    getBalance(accountId: string): Promise<{
        hbars: string;
    }>;
    handleUserCreated(payload: {
        userId: string;
        encryptionKey: string;
    }): Promise<void>;
}
