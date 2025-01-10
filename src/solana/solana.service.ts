import {
  AccountInfo,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { sendTxUsingJito } from "../lib/jito";
import { BOT_SERVICE_FEE_IN_SOL } from "../shared/config";
import { BOT_KEYPAIR } from "./config";
import {
  GLOBAL,
  JITO_TIP_ACCOUNT,
  PUMP_FUN_FEE_ACCOUNT,
  PUMP_FUN_PROGRAM_ID,
  PumpFunOperationIDs,
  UNKNOWN_ACCOUNT,
} from "./constants";
import { BumpOptions, SwapInstructionOptions, LiquidityPool } from "./types";

/**
 * @WARNING Notes:
 *
 * 1) Method `getCoinData` should not hit pump.fun bot solana network instead.
 */

export class SolanaService {
  constructor(
    private connection: Connection,
    private pumpFunService: PumpFunService
  ) {}

  getBalance(publicKey: PublicKey): Promise<number> {
    return this.connection.getBalance(publicKey);
  }

  async bump({
    mint,
    payer,
    includeBotFee,
    amount,
    slippage,
    priorityFee,
    associatedTokenAccount,
  }: BumpOptions): Promise<{
    signature: string;
    associatedTokenAccount: PublicKey;
  }> {
    const txBuilder = new Transaction();

    if (!associatedTokenAccount) {
      const response = await this.getAssociatedTokenAccount(
        mint,
        payer.publicKey
      );
      associatedTokenAccount = response.associatedTokenAccount;

      if (!response.exists) {
        txBuilder.add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedTokenAccount,
            payer.publicKey,
            mint
          )
        );
      }
    }

    if (includeBotFee) {
      txBuilder.add(this.botFeeInstruction(payer.publicKey));
    }

    const liquidityPool = await this.getLiquidityPool(mint);

    txBuilder.add(
      this.buyInstruction({
        mint,
        lamports: amount,
        slippage,
        ownerAccount: payer.publicKey,
        associatedTokenAccount,
        liquidityPool,
      })
    );

    txBuilder.add(
      this.sellInstruction({
        mint,
        lamports: amount,
        slippage,
        ownerAccount: payer.publicKey,
        associatedTokenAccount,
        liquidityPool,
      })
    );

    txBuilder.add(this.validatorTipInstruction(payer.publicKey, priorityFee));

    const { blockhash } = await this.connection.getLatestBlockhash("confirmed");
    txBuilder.recentBlockhash = blockhash;

    txBuilder.feePayer = payer.publicKey;
    txBuilder.sign(payer);

    const response = await sendTxUsingJito(txBuilder.serialize());
    return {
      signature: response.result,
      associatedTokenAccount,
    };
  }

  /** Calculates the associatedTokenAccount and then retrieves it if it exists */
  private async getAssociatedTokenAccount(
    mint: PublicKey,
    owner: PublicKey
  ): Promise<
    | {
        associatedTokenAccount: PublicKey;
        associatedTokenAccountInfo: AccountInfo<Buffer>;
        exists: true;
      }
    | {
        associatedTokenAccount: PublicKey;
        associatedTokenAccountInfo: null;
        exists: false;
      }
  > {
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint,
      owner,
      false
    );
    const associatedTokenAccountInfo = await this.connection.getAccountInfo(
      associatedTokenAccount
    );
    if (associatedTokenAccountInfo) {
      return {
        associatedTokenAccount,
        associatedTokenAccountInfo,
        exists: true,
      };
    } else {
      return {
        associatedTokenAccount,
        associatedTokenAccountInfo: null,
        exists: false,
      };
    }
  }

  private botFeeInstruction(payer: PublicKey): TransactionInstruction {
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: BOT_KEYPAIR.publicKey,
      lamports: BOT_SERVICE_FEE_IN_SOL * LAMPORTS_PER_SOL,
    });
  }

  private getLiquidityPool(mint: PublicKey): Promise<LiquidityPool> {
    return this.pumpFunService.getCoinData(mint.toString()).then(
      (coinData): LiquidityPool => ({
        virtualTokenReserves: coinData["virtual_token_reserves"],
        virtualSolReserves: coinData["virtual_sol_reserves"],
        bondingCurveAccount: new PublicKey(coinData["bonding_curve"]),
        associatedBondingCurveAccount: new PublicKey(
          coinData["associated_bonding_curve"]
        ),
      })
    );
  }

  private buyInstruction({
    mint,
    lamports,
    slippage,
    ownerAccount,
    associatedTokenAccount,
    liquidityPool,
  }: SwapInstructionOptions): TransactionInstruction {
    const tokensToBuy = Math.floor(
      (lamports * liquidityPool.virtualTokenReserves) /
        liquidityPool.virtualSolReserves
    );
    const maxLamportsToSpend = Math.floor(lamports * (1 + slippage));

    const buyKeys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      {
        pubkey: liquidityPool.bondingCurveAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: liquidityPool.associatedBondingCurveAccount,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
      { pubkey: ownerAccount, isSigner: false, isWritable: true },
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

    const buyData = this.createOperationData(
      PumpFunOperationIDs.BUY,
      tokensToBuy,
      maxLamportsToSpend
    );

    return new TransactionInstruction({
      keys: buyKeys,
      programId: PUMP_FUN_PROGRAM_ID,
      data: buyData,
    });
  }

  private sellInstruction({
    mint,
    lamports,
    slippage,
    ownerAccount,
    associatedTokenAccount,
    liquidityPool,
  }: SwapInstructionOptions): TransactionInstruction {
    const tokensToSell = Math.floor(
      (lamports * liquidityPool.virtualTokenReserves) /
        liquidityPool.virtualSolReserves
    );
    const minLamportsToReceive = Math.floor(
      (tokensToSell * (1 - slippage) * liquidityPool.virtualSolReserves) /
        liquidityPool.virtualTokenReserves
    );

    const sellKeys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      {
        pubkey: liquidityPool.bondingCurveAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: liquidityPool.associatedBondingCurveAccount,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
      { pubkey: ownerAccount, isSigner: false, isWritable: true },
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

    const sellData = this.createOperationData(
      PumpFunOperationIDs.SELL,
      tokensToSell,
      minLamportsToReceive
    );

    return new TransactionInstruction({
      keys: sellKeys,
      programId: PUMP_FUN_PROGRAM_ID,
      data: sellData,
    });
  }

  private validatorTipInstruction(
    payer: PublicKey,
    tip: number
  ): TransactionInstruction {
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: JITO_TIP_ACCOUNT,
      lamports: tip,
    });
  }

  private createOperationData(
    operation: PumpFunOperationIDs,
    tokens: number,
    lamports: number
  ): Buffer {
    const bufferFromUInt64 = (value: number | string) => {
      const buffer = Buffer.alloc(8);
      buffer.writeBigUInt64LE(BigInt(value));
      return buffer;
    };

    return Buffer.concat([
      bufferFromUInt64(operation),
      bufferFromUInt64(tokens),
      bufferFromUInt64(lamports),
    ]);
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
}
