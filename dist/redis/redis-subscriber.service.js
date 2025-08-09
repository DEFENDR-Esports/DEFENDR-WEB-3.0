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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const event_emitter_1 = require("@nestjs/event-emitter");
let RedisService = RedisService_1 = class RedisService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.channelsToListen = ['user_created', 'order_placed'];
    }
    onModuleInit() {
        return;
        this.subscriber = new ioredis_1.default({
            host: '192.168.1.7',
            port: 6379,
        });
        this.subscriber.on('connect', () => {
            this.logger.log('✅ Redis subscriber connected');
        });
        this.subscriber.on('error', (err) => {
            this.logger.error('❌ Redis subscriber error', err);
        });
        this.subscriber.subscribe(...this.channelsToListen, (err, count) => {
            if (err) {
                this.logger.error('Failed to subscribe:', err);
            }
            else {
                this.logger.log(`Subscribed to ${count} Redis channels`);
            }
        });
        this.subscriber.on('message', (channel, message) => {
            this.logger.log(`Received message on channel ${channel}`);
            try {
                const payload = JSON.parse(message);
                this.eventEmitter.emit(`redis.${channel}`, payload);
            }
            catch (err) {
                this.logger.warn('Invalid JSON received from Redis Pub/Sub.');
            }
        });
        this.publisher = new ioredis_1.default({
            host: '192.168.1.7',
            port: 6379,
        });
        this.publisher.on('connect', () => {
            this.logger.log('✅ Redis publisher connected');
        });
        this.publisher.on('error', (err) => {
            this.logger.error('❌ Redis publisher error', err);
        });
    }
    async publish(channel, message) {
        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        this.logger.log(`Publishing message to channel "${channel}": ${payload}`);
        return this.publisher.publish(channel, payload);
    }
    async setKey(key, value, ttlSeconds) {
        const payload = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
            this.logger.log(`Setting Redis key "${key}" with TTL ${ttlSeconds}s`);
            return this.publisher.set(key, payload, 'EX', ttlSeconds);
        }
        else {
            this.logger.log(`Setting Redis key "${key}" without TTL`);
            return this.publisher.set(key, payload);
        }
    }
    async getKey(key) {
        return this.publisher.get(key);
    }
    async onModuleDestroy() {
        this.logger.log('Closing Redis connections...');
        await Promise.all([this.subscriber.quit(), this.publisher.quit()]);
        this.logger.log('Redis connections closed');
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], RedisService);
//# sourceMappingURL=redis-subscriber.service.js.map