"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const token_controller_1 = require("./token.controller");
describe('TokenController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [token_controller_1.TokenController],
        }).compile();
        controller = module.get(token_controller_1.TokenController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=token.controller.spec.js.map