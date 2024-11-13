import {
  clusterApiUrl,
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
  BOT_SOL_FEE,
  RPC_API,
  PUMP_FUN_API,
  SOLANA_BOT_PRIVATE_KEY,
  SOLANA_PAYER_PRIVATE_KEY,
} from "../constants";
import bs58 from "bs58";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ASSOC_TOKEN_ACC_PROG,
  ASSOCIATED_TOKEN_ACC_SIZE,
  FEE_RECIPIENT,
  GLOBAL,
  PUMP_FUN_ACCOUNT,
  PUMP_FUN_PROGRAM,
  PUMP_FUN_SWAP_FEE_PERCENT,
  RENT,
  SIGNATURE_FEE_LAMPORTS,
  SYSTEM_PROGRAM_ID,
} from "../constants";
import nacl from "tweetnacl";
import { CoinData } from "./types";
import { CustomResponse } from "src/shared/types";

export enum TransactionMode {
  Simulation,
  Execution,
}

export class PumpFunService {
  private _transactionMode: TransactionMode = TransactionMode.Execution;
  private _botPrivateKey = SOLANA_BOT_PRIVATE_KEY;
  // private _payerPrivateKey = SOLANA_PAYER_PRIVATE_KEY;
  // private _priorityFeeInSol: number = 0.0025;
  // private _slippageDecimal: number = 0.25;

  private _baseUrl = PUMP_FUN_API;
  private _pumpFunHeaders = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.pump.fun/",
    Origin: "https://www.pump.fun",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };

  constructor(
    private _payerPrivateKey: string,
    private _priorityFeeInSol: number,
    private _slippageDecimal: number,
    private _solAmount: number
  ) {}

  async bump(mintStr: string): Promise<CustomResponse<string>> {
    try {
      const connection = new Connection(RPC_API, "confirmed");

      // Fetch coin data, shared for both buy and sell
      const coinData = await this.getCoinData(mintStr);
      if (!coinData) {
        console.error("Failed to retrieve coin data...");
        return {
          success: false,
          code: "FAILED_RETRIEVE_COIN_DATA",
        };
      }

      const payer = await this._keyPairFromPrivateKey(this._payerPrivateKey);
      const bot = await this._keyPairFromPrivateKey(this._botPrivateKey);
      const owner = payer.publicKey;
      const mint = new PublicKey(mintStr);
      const txBuilder = new Transaction();

      // Transaction Costs
      const solInLamports = this._solAmount * LAMPORTS_PER_SOL;
      const solInWithSlippage = this._solAmount * (1 + this._slippageDecimal);
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
        (tokenOut *
          (1 - this._slippageDecimal) *
          coinData["virtual_sol_reserves"]) /
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
        this._priorityFeeInSol
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

  async login(privateKey: string) {
    // Step 1: Initialize keypair from the private key
    const secretKey = bs58.decode(privateKey); // Decode the base58 private key
    const keypair = Keypair.fromSecretKey(secretKey);

    // Step 2: Generate a timestamp and create the sign-in message
    const timestamp = Date.now();
    const message = `Sign in to pump.fun: ${timestamp}`;
    const encodedMessage = new TextEncoder().encode(message);

    // Step 3: Sign the message using tweetnacl
    const signatureUint8Array = nacl.sign.detached(
      encodedMessage,
      keypair.secretKey
    );
    const signature = bs58.encode(signatureUint8Array); // Encode signature in base58

    // Step 4: Prepare the payload
    const payload = {
      address: keypair.publicKey.toBase58(),
      signature: signature,
      timestamp: timestamp,
    };

    // Step 5: Send the login request using fetch
    try {
      const response = await fetch(`${this._baseUrl}/auth/login`, {
        method: "POST",
        headers: this._pumpFunHeaders,
        body: JSON.stringify(payload),
      });

      // Get set-cookie header from response
      const setCookieHeader = response.headers.get("set-cookie");
      const data = await response.json();
      console.log(`Login ${response.ok ? "Succeeded" : "Failed"}:`, data);
      console.log("Set-Cookie Header:", setCookieHeader);
      return setCookieHeader;
    } catch (error) {
      console.error("Error during login:", error);
    }
  }

  async updateProfile(
    username: string,
    imageUrl: string,
    bio: string,
    authCookie: string
  ) {
    // Step 1: Prepare the payload with the user profile data
    const payload = {
      username,
      bio,
      profileImage: imageUrl,
    };

    // Step 2: Send the profile update request using fetch
    try {
      const response = await fetch(`${this._baseUrl}/users`, {
        method: "POST",
        headers: {
          ...this._pumpFunHeaders,
          Cookie: authCookie,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile update successful:", data);
      } else {
        console.error("Profile update failed:", await response.json());
      }
    } catch (error) {
      console.error("Error during profile update:", error);
    }
  }

  async getCoinData(mintStr: string): Promise<CoinData | null> {
    console.log("Mint String: ", mintStr);
    const url = `${this._baseUrl}/coins/${mintStr}`;

    try {
      const response = await fetch(url, { headers: this._pumpFunHeaders });

      if (response.ok) {
        return await response.json();
      } else {
        console.error("Failed to retrieve coin data:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return null;
    }
  }

  public async getRequiredBalance(mintStr: string) {
    const connection = new Connection(RPC_API, "confirmed");
    const payer = await this._keyPairFromPrivateKey(this._payerPrivateKey);
    const owner = payer.publicKey;
    const mint = new PublicKey(mintStr);

    // Transaction Costs
    const solInLamports = this._solAmount * LAMPORTS_PER_SOL;
    const solInWithSlippage = this._solAmount * (1 + this._slippageDecimal);
    const solInWithSlippageLamports = Math.floor(
      solInWithSlippage * LAMPORTS_PER_SOL
    );
    const swapFee = solInLamports * PUMP_FUN_SWAP_FEE_PERCENT; // 1% swap fee for pump.fun
    const signatureFee = SIGNATURE_FEE_LAMPORTS; // 5000 lamports per signature
    const priorityFeeLamports = this._priorityFeeInSol * LAMPORTS_PER_SOL; // priority fee, if applicable
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

  // private async _sendAndConfirmTransactionWrapper(
  //   connection: Connection,
  //   transaction: Transaction,
  //   signers: any[]
  // ) {
  //   try {
  //     const signature = await sendAndConfirmTransaction(
  //       connection,
  //       transaction,
  //       signers,
  //       { skipPreflight: true, preflightCommitment: "confirmed" }
  //     );
  //     console.log("Transaction confirmed with signature:", signature);
  //     return signature;
  //   } catch (error) {
  //     console.error("Error sending transaction:", error);
  //     return null;
  //   }
  // }
}
