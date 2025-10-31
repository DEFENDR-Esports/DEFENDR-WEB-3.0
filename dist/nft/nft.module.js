"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../config/config.module");
const ipfs_module_1 = require("../ipfs/ipfs.module");
const nft_service_1 = require("./nft.service");
const nft_controller_1 = require("./nft.controller");
const nft_metadata_service_1 = require("./nft-metadata.service");
let NftModule = class NftModule {
};
exports.NftModule = NftModule;
exports.NftModule = NftModule = __decorate([
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule, ipfs_module_1.IpfsModule],
        controllers: [nft_controller_1.NftController],
        providers: [nft_service_1.NftService, nft_metadata_service_1.NftMetadataService],
        exports: [nft_service_1.NftService, nft_metadata_service_1.NftMetadataService],
    })
], NftModule);
//# sourceMappingURL=nft.module.js.map