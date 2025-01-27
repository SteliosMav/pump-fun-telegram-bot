import { Injectable } from "@nestjs/common";
import { BotSessionData } from "../bot.context";
import { UserService } from "../../core/user/user.service";

@Injectable()
export class SettingsService {
  constructor(private readonly userService: UserService) {}

  async updateSlippage(
    session: BotSessionData,
    slippageDecimal: number
  ): Promise<void> {
    await this.userService.updateSlippage(
      session.user.telegram.id,
      slippageDecimal
    );
    session.user.bumpSettings.slippage = slippageDecimal;
  }

  async updateAmount(session: BotSessionData, amount: number): Promise<void> {
    await this.userService.updateAmount(session.user.telegram.id, amount);
    session.user.bumpSettings.amount = amount;
  }

  async updateInterval(
    session: BotSessionData,
    intervalInSeconds: number
  ): Promise<void> {
    await this.userService.updateInterval(
      session.user.telegram.id,
      intervalInSeconds
    );
    session.user.bumpSettings.intervalInSeconds = intervalInSeconds;
  }
}
