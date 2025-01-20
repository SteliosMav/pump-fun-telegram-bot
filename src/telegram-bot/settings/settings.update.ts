import { Action, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";

@Update()
export class SettingsUpdate {
  @Action("SET_SLIPPAGE")
  async onSetSlippage(@Ctx() ctx: BotContext) {
    // Acknowledge the callback
    await ctx.answerCbQuery();

    // Route to the corresponding scene
    ctx.scene.enter("slippageScene");
  }

  @Action("BACK")
  async onBack(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply("Returning to the start page...", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Start Bumping", callback_data: "START_BUMPING" }],
          [{ text: "Settings", callback_data: "SETTINGS" }],
        ],
      },
    });
  }
}
