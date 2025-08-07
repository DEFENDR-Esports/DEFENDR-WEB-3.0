import { Injectable } from "@nestjs/common";
import {
  AccountCreateTransaction,
  Client,
  Mnemonic,
  PrivateKey,
  AccountId,
  AccountBalanceQuery,
  Hbar,
} from "@hashgraph/sdk";

@Injectable()
export class WalletService {
  private client: Client;

  constructor() {
    // For testnet setup. Replace with mainnet if needed.
    this.client = Client.forTestnet();
    this.client.setOperator(
      process.env.OPERATOR_ID!,
      process.env.OPERATOR_KEY!
    );
  }

  async generateWallet() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = process.env.OPERATOR_KEY;
    const network = process.env.HEDERA_NETWORK || "testnet";

    console.log("Creating Hedera wallet...", operatorId, operatorKey, network);

    // Init client
    const client = Client.forName(network);
    client.setOperator(operatorId, operatorKey);

    // 1. Generate a new mnemonic (24 words) and derive keys
    const mnemonic = await Mnemonic.generate();
    const privateKey = await mnemonic.toPrivateKey(); // derived from mnemonic
    const publicKey = privateKey?.publicKey;

    // 2. Create new account on Hedera
    const tx = await new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(new Hbar(1)) // 1 HBAR (from operator account)
        .execute(client);

    // 3. Get new account ID
    const receipt = await tx.getReceipt(client);
    const newAccountId = receipt.accountId.toString();

    return {
        accountId: newAccountId,
        mnemonic: mnemonic.toString(),               // this is the backup phrase
        privateKey: privateKey.toStringRaw(),
        publicKey: publicKey.toStringRaw(),
    };
  }

  async getBalance(accountId: string) {
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(this.client);

    return {
      hbars: balance.hbars.toString(),
    };
  }
}
