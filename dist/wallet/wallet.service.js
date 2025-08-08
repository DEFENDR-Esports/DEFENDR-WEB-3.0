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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@hashgraph/sdk");
let WalletService = class WalletService {
    constructor() {
        this.client = sdk_1.Client.forTestnet();
        this.client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);
    }
    async generateWallet() {
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = process.env.OPERATOR_KEY;
        const network = process.env.HEDERA_NETWORK || "testnet";
        console.log("Creating Hedera wallet...", operatorId, operatorKey, network);
        const client = sdk_1.Client.forName(network);
        client.setOperator(operatorId, operatorKey);
        const mnemonic = await sdk_1.Mnemonic.generate();
        const privateKey = await mnemonic.toPrivateKey();
        const publicKey = privateKey === null || privateKey === void 0 ? void 0 : privateKey.publicKey;
        const tx = await new sdk_1.AccountCreateTransaction()
            .setKey(publicKey)
            .setInitialBalance(new sdk_1.Hbar(1))
            .execute(client);
        const receipt = await tx.getReceipt(client);
        const newAccountId = receipt.accountId.toString();
        return {
            accountId: newAccountId,
            mnemonic: mnemonic.toString(),
            privateKey: privateKey.toStringRaw(),
            publicKey: publicKey.toStringRaw(),
        };
    }
    async getBalance(accountId) {
        const balance = await new sdk_1.AccountBalanceQuery()
            .setAccountId(sdk_1.AccountId.fromString(accountId))
            .execute(this.client);
        return {
            hbars: balance.hbars.toString(),
        };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WalletService);
//# sourceMappingURL=wallet.service.js.map