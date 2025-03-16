import { ConfigService } from "@nestjs/config";
import { TelegramInfo, UserDoc, UserRaw, UserRequiredFields } from "./types";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";
import { UpdateWriteOpResult } from "mongoose";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService
  ) {}

  getUserByTgId(telegramId: number): Promise<UserDoc | null> {
    return this.userRepo.findOne(telegramId);
  }

  createUser(user: Partial<UserRaw> & UserRequiredFields): Promise<UserDoc> {
    // Assign role
    const personalTelegramId = Number(
      this.configService.get<string>("PERSONAL_TG_ID")
    );
    const isUserMe = user.telegram.id === personalTelegramId;
    if (isUserMe) {
      user.role = "ADMIN";
    }

    // Save user
    return this.userRepo.create(user);
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

  addServicePass(telegramId: number, expiresAt?: Date): Promise<UserDoc | null>;
  addServicePass(
    telegramIds: number[],
    expiresAt?: Date
  ): Promise<UpdateWriteOpResult>;
  addServicePass(
    telegramIdOrIds: number | number[],
    expiresAt?: Date
  ): Promise<UserDoc | null | UpdateWriteOpResult> {
    if (Array.isArray(telegramIdOrIds)) {
      return this.userRepo.addServicePass(telegramIdOrIds, expiresAt);
    } else {
      return this.userRepo.addServicePass(telegramIdOrIds, expiresAt);
    }
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

  markUsersWhoBannedBot(telegramIds: number[]): Promise<UpdateWriteOpResult> {
    return this.userRepo.updateTelegramInfo(telegramIds, {
      hasBannedBot: true,
    });
  }

  unmarkUserWhoBannedBot(telegramId: number): Promise<UserDoc | null> {
    return this.userRepo.updateTelegramInfo(telegramId, {
      hasBannedBot: false,
    });
  }

  updatePumpFunAccountStatus(
    telegramIds: number[],
    isSet: boolean
  ): Promise<UpdateWriteOpResult> {
    return this.userRepo.updateIsPumpFunAccountSet(telegramIds, isSet);
  }

  findReachableUsers(): Promise<number[]> {
    return this.userRepo.findReachableUsers();
  }
}
