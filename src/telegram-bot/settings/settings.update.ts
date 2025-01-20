import { Action, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";

@Update()
export class SettingsUpdate {
  @Action("SET_SLIPPAGE")
  async onSetSlippage(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter("slippage");
  }

  @Action("START")
  async onBack(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter("start");
  }
}
