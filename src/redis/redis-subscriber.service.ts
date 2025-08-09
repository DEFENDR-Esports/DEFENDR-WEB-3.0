import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private subscriber: Redis;
  private publisher: Redis;

  private readonly channelsToListen = ['user_created', 'order_placed'];

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    
    // Create subscriber Redis client
    this.subscriber = new Redis({
      host: '192.168.1.7',
      port: 6379,
    });

    this.subscriber.on('connect', () => {
      this.logger.log('✅ Redis subscriber connected');
    });

    this.subscriber.on('error', (err) => {
      this.logger.error('❌ Redis subscriber error', err);
    });

    // Subscribe to channels
    this.subscriber.subscribe(...this.channelsToListen, (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe:', err);
      } else {
        this.logger.log(`Subscribed to ${count} Redis channels`);
      }
    });

    this.subscriber.on('message', (channel, message) => {
      this.logger.log(`Received message on channel ${channel}`);
      try {
        const payload = JSON.parse(message);
        this.eventEmitter.emit(`redis.${channel}`, payload);
      } catch (err) {
        this.logger.warn('Invalid JSON received from Redis Pub/Sub.');
      }
    });

    // Create publisher Redis client
    this.publisher = new Redis({
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

  async publish(channel: string, message: any): Promise<number> {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    this.logger.log(`Publishing message to channel "${channel}": ${payload}`);
    return this.publisher.publish(channel, payload);
  }

  async setKey(key: string, value: any, ttlSeconds?: number): Promise<'OK'> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      this.logger.log(`Setting Redis key "${key}" with TTL ${ttlSeconds}s`);
      return this.publisher.set(key, payload, 'EX', ttlSeconds);
    } else {
      this.logger.log(`Setting Redis key "${key}" without TTL`);
      return this.publisher.set(key, payload);
    }
  }

  async getKey(key: string): Promise<string | null> {
    return this.publisher.get(key);
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connections...');
    await Promise.all([this.subscriber.quit(), this.publisher.quit()]);
    this.logger.log('Redis connections closed');
  }
}
