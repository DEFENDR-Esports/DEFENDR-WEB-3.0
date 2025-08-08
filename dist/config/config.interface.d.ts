export interface HederaConfig {
    operatorId: string;
    operatorKey: string;
    network: 'testnet' | 'mainnet' | 'previewnet';
}
export interface Config {
    hedera: HederaConfig;
}
