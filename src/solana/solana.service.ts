import {
  AccountInfo,
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
import { PumpFunService } from "../pump-fun/pump-fun.service";
import {
  ACCOUNT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { sendTxUsingJito } from "../lib/jito";
import { BOT_SERVICE_FEE_IN_SOL } from "../shared/config";
import { BOT_KEYPAIR } from "./config";
import {
  PUMP_FUN_GLOBAL_ACCOUNT,
  JITO_TIP_ACCOUNT,
  PUMP_FUN_FEE_ACCOUNT,
  PUMP_FUN_PROGRAM_ID,
  PUMP_FUN_EVENT_AUTHORITY_ACCOUNT,
  PUMP_FUN_OPERATION_IDS,
} from "./constants";
import {
  BumpParams,
  OperationInstructionParams,
  BondingCurve,
  PumpFunOperationIDs,
} from "./types";
import { struct, u64, bool } from "@coral-xyz/borsh";

export class SolanaService {
  constructor(
    private connection: Connection,
    /**
     * @WARNING After creating method in solana service that retrieves token's liquidity
     * pool, remove pumpFunServcie dependency. It creates circular dependency injection.
     */
    private pumpFunService: PumpFunService
  ) {}

  getBalance(publicKey: PublicKey): Promise<number> {
    return this.connection.getBalance(publicKey);
  }

  transfer(lamports: number, from: Keypair, to: PublicKey): Promise<string> {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports,
      })
    );
    return sendAndConfirmTransaction(this.connection, transaction, [from]);
  }

  async bump({
    mint,
    payer,
    associatedTokenAccount,
    createAssociatedTokenAccount,
    includeBotFee,
    amount,
    slippage,
    priorityFee,
  }: BumpParams): Promise<string> {
    const txBuilder = new Transaction();

    if (createAssociatedTokenAccount) {
      txBuilder.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedTokenAccount,
          payer.publicKey,
          mint
        )
      );
    }

    if (includeBotFee) {
      txBuilder.add(this.botFeeInstruction(payer.publicKey));
    }

    const bondingCurve = await this.getBondingCurve(mint);

    txBuilder.add(
      this.buyInstruction({
        mint,
        lamports: amount,
        slippage,
        ownerAccount: payer.publicKey,
        associatedTokenAccount,
        bondingCurve,
      })
    );

    txBuilder.add(
      this.sellInstruction({
        mint,
        lamports: amount,
        slippage,
        ownerAccount: payer.publicKey,
        associatedTokenAccount,
        bondingCurve,
      })
    );

    txBuilder.add(this.validatorTipInstruction(payer.publicKey, priorityFee));

    const { blockhash } = await this.connection.getLatestBlockhash("confirmed");
    txBuilder.recentBlockhash = blockhash;

    txBuilder.feePayer = payer.publicKey;
    txBuilder.sign(payer);

    const response = await sendTxUsingJito(txBuilder.serialize());

    return response.result;
  }

  /** Calculates the associatedTokenAccount and then retrieves it if it exists */
  async getAssociatedToken(
    mint: PublicKey,
    owner: PublicKey
  ): Promise<
    | {
        account: PublicKey;
        accountInfo: AccountInfo<Buffer>;
        exists: true;
      }
    | {
        account: PublicKey;
        accountInfo: null;
        exists: false;
      }
  > {
    const account = await getAssociatedTokenAddress(mint, owner, false);
    const accountInfo = await this.connection.getAccountInfo(account);
    if (accountInfo) {
      return {
        account,
        accountInfo,
        exists: true,
      };
    } else {
      return {
        account,
        accountInfo: null,
        exists: false,
      };
    }
  }

  /**
   * Currently, the rent rate is a static amount. For associated tokens it's 2039280 lamports.
   * Non-system accounts must maintain a lamport balance greater than the minimum required
   * to store its respective data on-chain.
   */
  getAssociatedTokenRent() {
    return this.connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);
  }

  async getBondingCurve(mint: PublicKey): Promise<BondingCurve> {
    const [bondingCurvePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding-curve"), mint.toBuffer()],
      PUMP_FUN_PROGRAM_ID
    );
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint,
      bondingCurvePDA,
      true
    );

    const accountInfo = await this.connection.getAccountInfo(bondingCurvePDA);
    if (!accountInfo) {
      throw new Error(
        `Could not find bonding curve for token: ${mint.toString()}`
      );
    }

    /** @WARNING create a separate file that holds borsh schemas and use the typescript version */
    const bondingCurveSchema = struct([
      u64("discriminator"),
      u64("virtualTokenReserves"),
      u64("virtualSolReserves"),
      u64("realTokenReserves"),
      u64("realSolReserves"),
      u64("tokenTotalSupply"),
      bool("complete"),
    ]);
    const parsedData = bondingCurveSchema.decode(accountInfo.data);

    return {
      virtualTokenReserves: Number(parsedData.virtualTokenReserves),
      virtualSolReserves: Number(parsedData.virtualSolReserves),
      account: bondingCurvePDA,
      associatedAccount: associatedBondingCurve,
    };
  }

  private botFeeInstruction(payer: PublicKey): TransactionInstruction {
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: BOT_KEYPAIR.publicKey,
      lamports: BOT_SERVICE_FEE_IN_SOL * LAMPORTS_PER_SOL,
    });
  }

  private buyInstruction({
    mint,
    lamports,
    slippage,
    ownerAccount,
    associatedTokenAccount,
    bondingCurve,
  }: OperationInstructionParams): TransactionInstruction {
    const tokensToBuy = Math.floor(
      (lamports * bondingCurve.virtualTokenReserves) /
        bondingCurve.virtualSolReserves
    );
    const maxLamportsToSpend = Math.floor(lamports * (1 + slippage));

    const buyKeys = this.createInstructionKeys({
      operation: "BUY",
      mint,
      associatedTokenAccount,
      ownerAccount,
      bondingCurve,
    });

    const buyData = this.createInstructionData(
      "BUY",
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
    bondingCurve,
  }: OperationInstructionParams): TransactionInstruction {
    const tokensToSell = Math.floor(
      (lamports * bondingCurve.virtualTokenReserves) /
        bondingCurve.virtualSolReserves
    );
    const minLamportsToReceive = Math.floor(
      (tokensToSell * (1 - slippage) * bondingCurve.virtualSolReserves) /
        bondingCurve.virtualTokenReserves
    );

    const sellKeys = this.createInstructionKeys({
      operation: "SELL",
      mint,
      associatedTokenAccount,
      ownerAccount,
      bondingCurve,
    });

    const sellData = this.createInstructionData(
      "SELL",
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

  private createInstructionKeys({
    operation,
    mint,
    associatedTokenAccount,
    ownerAccount,
    bondingCurve,
  }: {
    operation: keyof Pick<PumpFunOperationIDs, "BUY" | "SELL">;
    mint: PublicKey;
    associatedTokenAccount: PublicKey;
    ownerAccount: PublicKey;
    bondingCurve: BondingCurve;
  }): TransactionInstruction["keys"] {
    return [
      { pubkey: PUMP_FUN_GLOBAL_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_FEE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      {
        pubkey: bondingCurve.account,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: bondingCurve.associatedAccount,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: associatedTokenAccount, isSigner: false, isWritable: true },
      { pubkey: ownerAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      // Applicable only on sell.
      ...(operation === "SELL"
        ? [
            {
              pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
              isSigner: false,
              isWritable: false,
            },
          ]
        : []),
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      // Applicable only on buy.
      ...(operation === "BUY"
        ? [{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }]
        : []),
      {
        pubkey: PUMP_FUN_EVENT_AUTHORITY_ACCOUNT,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];
  }

  private createInstructionData(
    operation: keyof Pick<PumpFunOperationIDs, "BUY" | "SELL">,
    tokens: number,
    lamports: number
  ): TransactionInstruction["data"] {
    /**
     * @WARNING Consider adding borsh here
     */
    const bufferFromUInt64 = (value: number | string) => {
      const buffer = Buffer.alloc(8);
      buffer.writeBigUInt64LE(BigInt(value));
      return buffer;
    };

    return Buffer.concat([
      bufferFromUInt64(PUMP_FUN_OPERATION_IDS[operation]),
      bufferFromUInt64(tokens),
      bufferFromUInt64(lamports),
    ]);
  }
}
