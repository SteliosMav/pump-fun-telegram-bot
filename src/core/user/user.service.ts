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

  updateAmount(telegramId: number, amount: number): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { amount });
  }

  updateInterval(
    telegramId: number,
    intervalInSeconds: number
  ): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { intervalInSeconds });
  }

  updatePriorityFee(
    telegramId: number,
    priorityFee: number
  ): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { priorityFee });
  }

  updateLimit(telegramId: number, limit: number): Promise<UserDoc | null> {
    return this.userRepo.updateBumpSettings(telegramId, { limit });
  }

  addServicePass(
    telegramId: number,
    expirationDate?: Date
  ): Promise<UserDoc | null> {
    return this.userRepo.addServicePass(telegramId, expirationDate);
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
}
