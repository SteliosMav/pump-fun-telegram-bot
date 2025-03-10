import { Injectable } from "@nestjs/common";
import { BotSessionData } from "../bot.context";
import { UserService } from "../../core/user/user.service";
import { getUserNotFoundForUpdateMsg } from "../../shared/error-messages";

@Injectable()
export class SettingsService {
  constructor(private readonly userService: UserService) {}

  async updateSlippage(
    session: BotSessionData,
    slippageDecimal: number
  ): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.updateSlippage(
      telegramId,
      slippageDecimal
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  async updateAmount(session: BotSessionData, amount: number): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.updateAmount(telegramId, amount);

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  async updateInterval(
    session: BotSessionData,
    intervalInSeconds: number
  ): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.updateInterval(
      telegramId,
      intervalInSeconds
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  async updatePriorityFee(
    session: BotSessionData,
    priorityFee: number
  ): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.updatePriorityFee(
      telegramId,
      priorityFee
    );

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }

  async updateLimit(session: BotSessionData, limit: number): Promise<void> {
    const telegramId = session.user.telegram.id;
    const updatedUser = await this.userService.updateLimit(telegramId, limit);

    if (!updatedUser) {
      throw new Error(getUserNotFoundForUpdateMsg(telegramId));
    }

    session.user = updatedUser;
  }
}
