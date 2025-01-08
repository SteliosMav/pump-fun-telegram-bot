import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SIGNATURE_FEE_LAMPORTS } from "../shared/constants";
import bs58 from "bs58";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { sendTxUsingJito } from "../lib/jito";
import { CustomResponse } from "../shared/types";
import { isValidValidatorTip } from "../telegram-bot/validators";
import {
  BOT_SERVICE_FEE_IN_SOL,
  BOT_TOKEN_PASS_PRICE_IN_SOL,
} from "../shared/config";
import { BumpSettings } from "../user";
import { BOT_KEYPAIR, HELIUS_API_STANDARD } from "./config";
import {
  GLOBAL,
  JITO_TIP_ACCOUNT,
  PUMP_FUN_FEE_ACCOUNT,
  PUMP_FUN_PROGRAM_ID,
  UNKNOWN_ACCOUNT,
} from "./constants";

/**
 * @WARNING Notes:
 *
 * 1) Method `getCoinData` should not hit pump.fun bot solana network instead.
 */

export class SolanaService {
  private connection = new Connection(HELIUS_API_STANDARD, "confirmed");

  constructor(private pumpFunService: PumpFunService) {}

  getBalance(publicKey: PublicKey): Promise<number> {
    return this.connection.getBalance(publicKey);
  }

  async bump(
    mint: PublicKey,
    payer: Keypair,
    includeBotFee: boolean,
    {
      amount,
      slippage,
      priorityFee,
    }: Pick<BumpSettings, "amount" | "slippage" | "priorityFee">
  ): Promise<CustomResponse<string>> {
    const txBuilder = new Transaction();

    // Rent Exemption Check for Token Account
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mint,
      payer.publicKey,
      false
    );
    const tokenAccountInfo = await this.connection.getAccountInfo(
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

    // Step 1: Transfer bot fee to the bot
    if (includeBotFee) {
      const botFeeTransferInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: BOT_KEYPAIR.publicKey,
        lamports: BOT_SERVICE_FEE_IN_SOL * LAMPORTS_PER_SOL,
      });
      txBuilder.add(botFeeTransferInstruction);
    }

    const coinData = await this.pumpFunService.getCoinData(mint.toString());

    // Step 2: Buy instructions
    const tokenOut = Math.floor(
      (amount * coinData["virtual_token_reserves"]) /
        coinData["virtual_sol_reserves"]
    );
    const maxSolCost = Math.floor(amount * (1 + slippage));
    const ASSOCIATED_USER = tokenAccount;
    const BONDING_CURVE = new PublicKey(coinData["bonding_curve"]);
    const ASSOCIATED_BONDING_CURVE = new PublicKey(
      coinData["associated_bonding_curve"]
    );

    const buyKeys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_USER, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      /**
       * @note SYSVAR Account for querying data such as rent calculation.
       * Not sure if I need it. Got to check.
       */
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: UNKNOWN_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const buyData = Buffer.concat([
      this._bufferFromUInt64("16927863322537952870"), // Buy operation ID
      this._bufferFromUInt64(tokenOut),
      this._bufferFromUInt64(maxSolCost),
    ]);

    const buyInstruction = new TransactionInstruction({
      keys: buyKeys,
      programId: PUMP_FUN_PROGRAM_ID,
      data: buyData,
    });
    txBuilder.add(buyInstruction);

    // Step 3: Sell instructions
    const minSolOutput = Math.floor(
      (tokenOut * (1 - slippage) * coinData["virtual_sol_reserves"]) /
        coinData["virtual_token_reserves"]
    );

    const sellKeys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      {
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: UNKNOWN_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    const sellData = Buffer.concat([
      this._bufferFromUInt64("12502976635542562355"), // Sell operation ID
      this._bufferFromUInt64(tokenOut),
      this._bufferFromUInt64(minSolOutput),
    ]);

    const sellInstruction = new TransactionInstruction({
      keys: sellKeys,
      programId: PUMP_FUN_PROGRAM_ID,
      data: sellData,
    });
    txBuilder.add(sellInstruction);

    try {
      // **Step 4: Add the Jito validator tip**
      const tipInstruction = SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: JITO_TIP_ACCOUNT,
        lamports: priorityFee,
      });
      txBuilder.add(tipInstruction);

      // Set recentBlockhash before signing the transaction
      const { blockhash } = await this.connection.getLatestBlockhash(
        "confirmed"
      );
      txBuilder.recentBlockhash = blockhash;
      txBuilder.feePayer = payer.publicKey;

      // Sign the transaction
      txBuilder.sign(payer);

      // Serialize the transaction
      const serializedTx = txBuilder.serialize();

      const res = await sendTxUsingJito({
        serializedTx: serializedTx,
        region: "mainnet", // Change this if you need another region
      });
      return {
        success: true,
        data: res.result,
      };
    } catch (error) {
      console.error("Error sending transaction:", error);
      return {
        success: false,
        code: "TRANSACTION_FAILED",
        error,
      };
    }
  }

  // public async getRequiredBalance(
  //   payerPrivateKey: string,
  //   priorityFeeInSol: number,
  //   slippageDecimal: number,
  //   solAmount: number,
  //   bumpsLimit: number,
  //   mintStr: string,
  //   includeBotFee: boolean = true
  // ) {
  //   const connection = new Connection(HELIUS_API_STANDARD, "confirmed");
  //   const payer = await this._keyPairFromPrivateKey(payerPrivateKey);
  //   const owner = payer.publicKey;
  //   const mint = new PublicKey(mintStr);

  //   // Transaction Costs
  //   const solInLamports = solAmount * LAMPORTS_PER_SOL;
  //   const solInWithSlippage = solAmount * (1 + slippageDecimal);
  //   const solInWithSlippageLamports = Math.floor(
  //     solInWithSlippage * LAMPORTS_PER_SOL
  //   );
  //   const swapFee = solInLamports * this.PUMP_FUN_SWAP_FEE_PERCENT; // 1% swap fee for pump.fun
  //   const signatureFee = SIGNATURE_FEE_LAMPORTS; // 5000 lamports per signature
  //   const priorityFeeLamports = priorityFeeInSol * LAMPORTS_PER_SOL; // priority fee, if applicable
  //   let minRentExemption = 0; // rent fee for creating associated token account if it doesn't exist
  //   const botFee = includeBotFee
  //     ? BOT_SERVICE_FEE_IN_SOL * LAMPORTS_PER_SOL
  //     : 0; // bot fee in lamports

  //   // Rent Exemption Check for Token Account
  //   const tokenAccountAddress = await getAssociatedTokenAddress(
  //     mint,
  //     owner,
  //     false
  //   );
  //   const tokenAccountInfo = await connection.getAccountInfo(
  //     tokenAccountAddress
  //   );

  //   if (!tokenAccountInfo) {
  //     // Minimum rent exemption for creating new associated token account
  //     minRentExemption = await connection.getMinimumBalanceForRentExemption(
  //       this.ASSOCIATED_TOKEN_ACC_SIZE
  //     );
  //   }
  //   // Calculate total required balance, including slippage and bot fee
  //   const totalRequiredBalance =
  //     minRentExemption +
  //     solInWithSlippageLamports +
  //     (swapFee + signatureFee + priorityFeeLamports + botFee * bumpsLimit);

  //   // Get the payer's balance
  //   const payerBalance = await connection.getBalance(payer.publicKey);

  //   // Check if payer has enough balance for all costs
  //   return { payerBalance, totalRequiredBalance };
  // }

  // /**
  //  * Transfer SOL from payer to receiver.
  //  * @param payerPrivateKey The private key of the payer as a base58 string.
  //  * @returns The transaction signature of the transfer.
  //  */
  // async applyBuyTokenPassTx(
  //   payerPrivateKey: string
  // ): Promise<CustomResponse<string>> {
  //   // return {
  //   //   success: true,
  //   //   data: "signature",
  //   // };
  //   try {
  //     const connection = new Connection(HELIUS_API_STANDARD, "confirmed");
  //     const payerKeypair = await this._keyPairFromPrivateKey(payerPrivateKey);
  //     const bot = await this._keyPairFromPrivateKey(this._botPrivateKey);
  //     const receiverKey = bot.publicKey;

  //     const lamports = BOT_TOKEN_PASS_PRICE_IN_SOL * LAMPORTS_PER_SOL; // Convert SOL to lamports

  //     const transaction = new Transaction().add(
  //       SystemProgram.transfer({
  //         fromPubkey: payerKeypair.publicKey,
  //         toPubkey: receiverKey,
  //         lamports,
  //       })
  //     );

  //     const signature = await sendAndConfirmTransaction(
  //       connection,
  //       transaction,
  //       [payerKeypair]
  //     );

  //     return {
  //       success: true,
  //       data: signature,
  //     };
  //   } catch (error) {
  //     console.error("Error in applyBuyTokenPassTx:", error);
  //     return {
  //       success: false,
  //       code: "TRANSACTION_FAILED",
  //       error,
  //     };
  //   }
  // }

  private _bufferFromUInt64(value: number | string) {
    let buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value));
    return buffer;
  }
}
