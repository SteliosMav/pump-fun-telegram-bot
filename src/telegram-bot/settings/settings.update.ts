import { Action, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SettingsAction } from "./constants";

@Update()
export class SettingsUpdate {
  @Action(SettingsAction.SET_SLIPPAGE)
  async onSetSlippage(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SettingsAction.SET_SLIPPAGE);
  }
}
