"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const token_service_1 = require("./token.service");
describe('TokenService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [token_service_1.TokenService],
        }).compile();
        service = module.get(token_service_1.TokenService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=token.service.spec.js.map