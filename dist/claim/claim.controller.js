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
var ClaimController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimController = void 0;
const common_1 = require("@nestjs/common");
const claim_service_1 = require("./claim.service");
let ClaimController = ClaimController_1 = class ClaimController {
    constructor(claimService) {
        this.claimService = claimService;
        this.logger = new common_1.Logger(ClaimController_1.name);
    }
    async claimNft(request) {
        try {
            if (!request.user) {
                throw new common_1.HttpException('User information is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!request.mission) {
                throw new common_1.HttpException('Mission information is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!request.tokenAmount || request.tokenAmount <= 0) {
                throw new common_1.HttpException('Invalid token amount', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`NFT claim attempt for user: ${request.user.accountId}, mission: ${request.mission.id}`);
            const result = await this.claimService.claimNftWithMission(request);
            return result;
        }
        catch (error) {
            this.logger.error(`Error during claim: ${error.message}`);
            throw new common_1.HttpException(error.message || 'Error claiming NFT', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async healthCheck() {
        return {
            status: 'ok',
            message: 'Claim service operational',
        };
    }
};
exports.ClaimController = ClaimController;
__decorate([
    (0, common_1.Post)('nft'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClaimController.prototype, "claimNft", null);
__decorate([
    (0, common_1.Post)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClaimController.prototype, "healthCheck", null);
exports.ClaimController = ClaimController = ClaimController_1 = __decorate([
    (0, common_1.Controller)('claim'),
    __metadata("design:paramtypes", [claim_service_1.ClaimService])
], ClaimController);
//# sourceMappingURL=claim.controller.js.map