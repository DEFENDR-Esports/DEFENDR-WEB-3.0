"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const wallet_controller_1 = require("./wallet.controller");
describe('WalletController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [wallet_controller_1.WalletController],
        }).compile();
        controller = module.get(wallet_controller_1.WalletController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=wallet.controller.spec.js.map