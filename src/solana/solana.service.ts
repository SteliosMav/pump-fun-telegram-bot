import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOC_TOKEN_ACC_PROG,
  ASSOCIATED_TOKEN_ACC_SIZE,
  BOT_SOL_FEE,
  FEE_RECIPIENT,
  GLOBAL,
  PUMP_FUN_ACCOUNT,
  PUMP_FUN_PROGRAM,
  PUMP_FUN_SWAP_FEE_PERCENT,
  RENT,
  RPC_API,
  SIGNATURE_FEE_LAMPORTS,
  SOLANA_BOT_PRIVATE_KEY,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "src/constants";
import bs58 from "bs58";
import { PumpFunService } from "src/pump-fun/pump-fun.service";
import { CustomResponse } from "src/shared/types";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

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

  async bump(
    payerPrivateKey: string,
    priorityFeeInSol: number,
    slippageDecimal: number,
    solAmount: number,
    mintStr: string
  ): Promise<CustomResponse<string>> {
    try {
      const connection = new Connection(RPC_API, "confirmed");
      const pumpFunService = new PumpFunService();

      // Fetch coin data, shared for both buy and sell
      const coinData = await pumpFunService.getCoinData(mintStr);
      if (!coinData) {
        console.error("Failed to retrieve coin data...");
        return {
          success: false,
          code: "FAILED_RETRIEVE_COIN_DATA",
        };
      }

      const payer = await this._keyPairFromPrivateKey(payerPrivateKey);
      const bot = await this._keyPairFromPrivateKey(this._botPrivateKey);
      const owner = payer.publicKey;
      const mint = new PublicKey(mintStr);
      const txBuilder = new Transaction();

      // Transaction Costs
      const solInLamports = solAmount * LAMPORTS_PER_SOL;
      const solInWithSlippage = solAmount * (1 + slippageDecimal);
      const botFee = BOT_SOL_FEE * LAMPORTS_PER_SOL; // bot fee in lamports

      // Rent Exemption Check for Token Account
      const tokenAccountAddress = await getAssociatedTokenAddress(
        mint,
        owner,
        false
      );
      const tokenAccountInfo = await connection.getAccountInfo(
        tokenAccountAddress
      );
      let tokenAccount: PublicKey;

      if (!tokenAccountInfo) {
        // Add instruction to create the associated token account if it doesn't exist
        txBuilder.add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            tokenAccountAddress,
            payer.publicKey,
            mint
          )
        );
        tokenAccount = tokenAccountAddress;
      } else {
        tokenAccount = tokenAccountAddress;
      }

      /** This check is best to happen outside of the function. This function
       * handles the insufficient balance error, after the signature confirmation
       * request takes place. So better not check it here as well. Also, this method
       * can be called recursively, so it's better to handle the balance check outside.
      
      // Get the payer's balance
      const { totalRequiredBalance, payerBalance } =
        await this.getRequiredBalance(mintStr);
      const hasSufficientBalance = payerBalance >= totalRequiredBalance;

      // Check if payer has enough balance for all costs
      if (!hasSufficientBalance) {
        console.error(
          "Insufficient balance for rent exemption, transaction, and fees."
        );
        return {
          success: false,
          code: "INSUFFICIENT_BALANCE",
        };
      }
      */

      // Step 1: Transfer bot fee to the bot
      const botFeeTransferInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: bot.publicKey,
        lamports: botFee,
      });
      txBuilder.add(botFeeTransferInstruction);

      // Step 2: Buy instructions
      const tokenOut = Math.floor(
        (solInLamports * coinData["virtual_token_reserves"]) /
          coinData["virtual_sol_reserves"]
      );
      const maxSolCost = Math.floor(solInWithSlippage * LAMPORTS_PER_SOL);
      const ASSOCIATED_USER = tokenAccount;
      const USER = owner;
      const BONDING_CURVE = new PublicKey(coinData["bonding_curve"]);
      const ASSOCIATED_BONDING_CURVE = new PublicKey(
        coinData["associated_bonding_curve"]
      );

      const buyKeys = [
        { pubkey: GLOBAL, isSigner: false, isWritable: false },
        { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
        { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
        { pubkey: ASSOCIATED_USER, isSigner: false, isWritable: true },
        { pubkey: USER, isSigner: false, isWritable: true },
        { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: RENT, isSigner: false, isWritable: false },
        { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
        { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
      ];

      const buyData = Buffer.concat([
        this._bufferFromUInt64("16927863322537952870"), // Buy operation ID
        this._bufferFromUInt64(tokenOut),
        this._bufferFromUInt64(maxSolCost),
      ]);

      const buyInstruction = new TransactionInstruction({
        keys: buyKeys,
        programId: PUMP_FUN_PROGRAM,
        data: buyData,
      });
      txBuilder.add(buyInstruction);

      // Step 3: Sell instructions
      const minSolOutput = Math.floor(
        (tokenOut * (1 - slippageDecimal) * coinData["virtual_sol_reserves"]) /
          coinData["virtual_token_reserves"]
      );

      const sellKeys = [
        { pubkey: GLOBAL, isSigner: false, isWritable: false },
        { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
        { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
        { pubkey: tokenAccount, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: false, isWritable: true },
        { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOC_TOKEN_ACC_PROG, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
        { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
      ];

      const sellData = Buffer.concat([
        this._bufferFromUInt64("12502976635542562355"), // Sell operation ID
        this._bufferFromUInt64(tokenOut),
        this._bufferFromUInt64(minSolOutput),
      ]);

      const sellInstruction = new TransactionInstruction({
        keys: sellKeys,
        programId: PUMP_FUN_PROGRAM,
        data: sellData,
      });
      txBuilder.add(sellInstruction);

      // Finalize and send transaction
      const transaction = await this._createTransaction(
        connection,
        txBuilder.instructions,
        payer.publicKey,
        priorityFeeInSol
      );

      // return {
      //   success: false,
      //   code: "UNKNOWN_ERROR",
      // };

      try {
        const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [payer],
          { skipPreflight: true, preflightCommitment: "confirmed" }
        );
        console.log("Pump transaction confirmed:", signature);
        return {
          success: true,
          data: signature,
        };
      } catch (error) {
        // If there was an error, try to fetch the logs using the signature
        if (error && typeof error === "object" && "signature" in error) {
          const transactionDetails = await connection.getTransaction(
            error.signature as string,
            {
              commitment: "confirmed",
            }
          );

          if (transactionDetails) {
            const logs = transactionDetails.meta?.logMessages;
            const insufficientSol = logs?.some((log) =>
              log.toLowerCase().includes("insufficient lamports")
            );
            if (insufficientSol) {
              console.error("Insufficient SOL balance for transaction.");
              return {
                success: false,
                code: "INSUFFICIENT_BALANCE",
              };
            }
          }
        }
        console.error("Error sending transaction:", error);
        return {
          success: false,
          code: "TRANSACTION_FAILED",
          error,
        };
      }
    } catch (error) {
      console.error("Error in bump transaction:", error);
      return {
        code: "UNKNOWN_ERROR",
        success: false,
        error: error,
        message: "Bump failed.",
      };
    }
  }

  public async getRequiredBalance(
    payerPrivateKey: string,
    priorityFeeInSol: number,
    slippageDecimal: number,
    solAmount: number,
    mintStr: string
  ) {
    const connection = new Connection(RPC_API, "confirmed");
    const payer = await this._keyPairFromPrivateKey(payerPrivateKey);
    const owner = payer.publicKey;
    const mint = new PublicKey(mintStr);

    // Transaction Costs
    const solInLamports = solAmount * LAMPORTS_PER_SOL;
    const solInWithSlippage = solAmount * (1 + slippageDecimal);
    const solInWithSlippageLamports = Math.floor(
      solInWithSlippage * LAMPORTS_PER_SOL
    );
    const swapFee = solInLamports * PUMP_FUN_SWAP_FEE_PERCENT; // 1% swap fee for pump.fun
    const signatureFee = SIGNATURE_FEE_LAMPORTS; // 5000 lamports per signature
    const priorityFeeLamports = priorityFeeInSol * LAMPORTS_PER_SOL; // priority fee, if applicable
    let minRentExemption = 0; // rent fee for creating associated token account if it doesn't exist
    const botFee = BOT_SOL_FEE * LAMPORTS_PER_SOL; // bot fee in lamports

    // Rent Exemption Check for Token Account
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mint,
      owner,
      false
    );
    const tokenAccountInfo = await connection.getAccountInfo(
      tokenAccountAddress
    );

    if (!tokenAccountInfo) {
      // Minimum rent exemption for creating new associated token account
      minRentExemption = await connection.getMinimumBalanceForRentExemption(
        ASSOCIATED_TOKEN_ACC_SIZE
      );
    }
    // Calculate total required balance, including slippage and bot fee
    const totalRequiredBalance =
      minRentExemption +
      solInWithSlippageLamports +
      swapFee +
      signatureFee +
      priorityFeeLamports +
      botFee;

    // Get the payer's balance
    const payerBalance = await connection.getBalance(payer.publicKey);
    console.log("Payer balance:", payerBalance / LAMPORTS_PER_SOL);
    console.log(
      "Total required balance:",
      totalRequiredBalance / LAMPORTS_PER_SOL
    );

    // Check if payer has enough balance for all costs
    return { payerBalance, totalRequiredBalance };
  }

  private async _keyPairFromPrivateKey(privateKey: string) {
    return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
  }

  private _bufferFromUInt64(value: number | string) {
    let buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value));
    return buffer;
  }

  private async _createTransaction(
    connection: Connection,
    instructions: TransactionInstruction[],
    payer: PublicKey,
    priorityFeeInSol: number = 0
  ): Promise<Transaction> {
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const transaction = new Transaction().add(modifyComputeUnits);

    if (priorityFeeInSol > 0) {
      const microLamports = priorityFeeInSol * 1_000_000_000; // convert SOL to microLamports
      const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports,
      });
      transaction.add(addPriorityFee);
    }

    transaction.add(...instructions);

    transaction.feePayer = payer;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    return transaction;
  }
}
