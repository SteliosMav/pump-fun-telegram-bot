import { TelegramInfo, UserDoc } from "./types";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  getUserByTgId(telegramId: number): Promise<UserDoc | null> {
    return this.userRepo.find(telegramId);
  }

  createUser(
    telegram: TelegramInfo,
    encryptedPrivateKey: string
  ): Promise<UserDoc> {
    return this.userRepo.create({ telegram, encryptedPrivateKey });
  }

  updateSlippage(
    telegramId: number,
    slippage: number
  ): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { slippage });
  }

  updateAmount(
    telegramId: number,
    amountInSol: number
  ): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { amountInSol });
  }

  updateInterval(
    telegramId: number,
    intervalInSeconds: number
  ): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { intervalInSeconds });
  }

  updatePriorityFee(
    telegramId: number,
    priorityFeeInSol: number
  ): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { priorityFeeInSol });
  }

  updateLimit(telegramId: number, limit: number): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { limit });
  }

  addServicePass(
    telegramId: number,
    expiresAt?: Date
  ): Promise<UserDoc | null> {
    return this.userRepo.addServicePass(telegramId, expiresAt);
  }

  incrementTokenPassesLeft(
    telegramId: number,
    amount?: number
  ): Promise<UserDoc | null> {
    return this.userRepo.incrementTokenPassesLeft(telegramId, amount);
  }

  addUsedTokenPass(telegramId: number, mint: string): Promise<UserDoc | null> {
    return this.userRepo.addUsedTokenPass(telegramId, mint);
  }

  incrementBumps(
    telegramId: number,
    amount: number,
    context: "paid" | "servicePass" | { tokenPass: string }
  ): Promise<UserDoc | null> {
    return this.userRepo.incrementBumps(telegramId, amount, context);
  }
}
