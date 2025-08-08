"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const redis_subscriber_service_1 = require("./../redis/redis-subscriber.service");
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const utils_1 = require("../utils");
let WalletController = class WalletController {
    constructor(walletService, RedisService) {
        this.walletService = walletService;
        this.RedisService = RedisService;
    }
    getBalance(accountId) {
        return this.walletService.getBalance(accountId);
    }
    async handleUserCreated(payload) {
        const walletCreated = await this.walletService.generateWallet();
        const encryptedMnemonic = (0, utils_1.encryptData)(walletCreated.mnemonic, payload.encryptionKey);
        const encryptedPrivateKey = (0, utils_1.encryptData)(walletCreated.privateKey, payload.encryptionKey);
        const redisKey = `wallet:${payload.userId}`;
        const redisValue = JSON.stringify({
            accountId: walletCreated.accountId,
            publicKey: walletCreated.publicKey,
            encryptedMnemonic,
            encryptedPrivateKey,
        });
        await this.RedisService.setKey(redisKey, redisValue, 60 * 60);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(":accountId/balance"),
    __param(0, (0, common_1.Param)("accountId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, event_emitter_1.OnEvent)("redis.user_created"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "handleUserCreated", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)("wallet"),
    __metadata("design:paramtypes", [wallet_service_1.WalletService, redis_subscriber_service_1.RedisService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map