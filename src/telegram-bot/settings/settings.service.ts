import { Injectable } from "@nestjs/common";
import { BotSessionData } from "../bot.context";
import { UserService } from "../../core/user/user.service";

@Injectable()
export class SettingsService {
  constructor(private readonly userService: UserService) {}

  async updateSlippage(
    session: BotSessionData,
    slippage: number
  ): Promise<void> {
    await this.userService.updateSlippage(session.user.telegram.id, slippage);
    session.user.bumpSettings.slippage = slippage;
  }
}
