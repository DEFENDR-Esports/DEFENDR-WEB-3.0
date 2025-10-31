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
var TokenController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenController = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("./token.service");
let TokenController = TokenController_1 = class TokenController {
    constructor(tokenService) {
        this.tokenService = tokenService;
        this.logger = new common_1.Logger(TokenController_1.name);
    }
    async createDefendrRToken() {
        try {
            this.logger.log('Creating DEFENDR-R token...');
            const result = await this.tokenService.createDefendrRToken();
            return {
                success: true,
                tokenId: result.tokenId,
                transactionId: result.transactionId,
                associated: result.associated,
                message: `DEFENDR-R token created successfully! Token ID: ${result.tokenId}`,
            };
        }
        catch (error) {
            this.logger.error(`Error creating DEFENDR-R token: ${error.message}`);
            throw new common_1.HttpException(error.message || 'Error creating DEFENDR-R token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async mintDefendrRTokens(body) {
        try {
            if (!body.amount || body.amount <= 0) {
                throw new common_1.HttpException('Amount must be greater than 0', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`Minting ${body.amount} DEFENDR-R tokens...`);
            const result = await this.tokenService.mintDefendrRTokens(body.amount);
            return {
                success: true,
                status: result.status,
                transactionId: result.transactionId,
                newTotalSupply: result.newTotalSupply,
                message: `Successfully minted ${body.amount} DEFENDR-R tokens`,
            };
        }
        catch (error) {
            this.logger.error(`Error minting DEFENDR-R tokens: ${error.message}`);
            throw new common_1.HttpException(error.message || 'Error minting DEFENDR-R tokens', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TokenController = TokenController;
__decorate([
    (0, common_1.Post)('create-defendr-r'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "createDefendrRToken", null);
__decorate([
    (0, common_1.Post)('mint-defendr-r'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TokenController.prototype, "mintDefendrRTokens", null);
exports.TokenController = TokenController = TokenController_1 = __decorate([
    (0, common_1.Controller)('token'),
    __metadata("design:paramtypes", [token_service_1.TokenService])
], TokenController);
//# sourceMappingURL=token.controller.js.map