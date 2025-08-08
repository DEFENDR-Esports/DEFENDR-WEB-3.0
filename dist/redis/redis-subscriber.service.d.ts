import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private eventEmitter;
    private readonly logger;
    private subscriber;
    private publisher;
    private readonly channelsToListen;
    constructor(eventEmitter: EventEmitter2);
    onModuleInit(): void;
    publish(channel: string, message: any): Promise<number>;
    setKey(key: string, value: any, ttlSeconds?: number): Promise<'OK'>;
    getKey(key: string): Promise<string | null>;
    onModuleDestroy(): Promise<void>;
}
