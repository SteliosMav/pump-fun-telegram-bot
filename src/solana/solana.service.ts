import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { RPC_API, SOLANA_BOT_PRIVATE_KEY } from "src/constants";
import bs58 from "bs58";

export class SolanaService {
  private _botPrivateKey = SOLANA_BOT_PRIVATE_KEY;

  /**
   * Create a new Solana account on mainnet.
   * @returns The base58-encoded private key of the newly created account.
   */
  async createSolanaAccount(): Promise<string | null> {
    // Open connection
    const connection = new Connection(RPC_API, "confirmed");

    // Step 1: Convert the base58 private key to a Keypair
    const payerKeypair = Keypair.fromSecretKey(
      bs58.decode(this._botPrivateKey)
    );
    // Log payer's balance
    const payerBalance = await connection.getBalance(payerKeypair.publicKey);
    console.log("Payer balance:", payerBalance / LAMPORTS_PER_SOL);

    // Step 2: Generate a new Keypair for the new account
    const newAccountKeypair = Keypair.generate();
    const newAccountPublicKey = newAccountKeypair.publicKey;
    const newAccountPrivateKey = newAccountKeypair.secretKey;

    // Step 3: Determine the minimum balance for rent exemption
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0
    );

    // Step 4: Create a transaction to fund and create the new account on the blockchain
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payerKeypair.publicKey, // Payer funds the new account creation
        newAccountPubkey: newAccountPublicKey,
        lamports: minimumBalance, // Minimum rent-exemption balance
        space: 0, // No specific data storage
        programId: SystemProgram.programId,
      })
    );

    try {
      // Send and confirm the transaction
      await sendAndConfirmTransaction(connection, transaction, [
        payerKeypair,
        newAccountKeypair,
      ]);
      console.log(
        "Account created successfully:",
        newAccountPublicKey.toBase58()
      );
      // Log payer's balance
      const payerBalance = await connection.getBalance(payerKeypair.publicKey);
      console.log("Payer balance:", payerBalance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error creating account:", error);
      return null;
    }

    // Step 5: Return the private key of the newly created account as a base58 string
    return bs58.encode(newAccountPrivateKey);
  }

  async getBalance(publicKey: string): Promise<number> {
    // Open connection
    const connection = new Connection(RPC_API, "confirmed");

    // Convert the publicKey string to a PublicKey object
    const publicKeyObj = new PublicKey(publicKey);

    // Get balance
    const balance = await connection.getBalance(publicKeyObj);

    return balance / LAMPORTS_PER_SOL;
  }
}
