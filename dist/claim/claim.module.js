"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimModule = void 0;
const common_1 = require("@nestjs/common");
const claim_controller_1 = require("./claim.controller");
const claim_service_1 = require("./claim.service");
const nft_module_1 = require("../nft/nft.module");
const token_module_1 = require("../token/token.module");
const config_module_1 = require("../config/config.module");
let ClaimModule = class ClaimModule {
};
exports.ClaimModule = ClaimModule;
exports.ClaimModule = ClaimModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, nft_module_1.NftModule, token_module_1.TokenModule],
        controllers: [claim_controller_1.ClaimController],
        providers: [claim_service_1.ClaimService],
        exports: [claim_service_1.ClaimService],
    })
], ClaimModule);
//# sourceMappingURL=claim.module.js.map