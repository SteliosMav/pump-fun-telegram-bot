import { Scene, SceneEnter, On, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SharedAction } from "../shared/constants";

@Scene(SharedAction.SETTINGS)
export class SettingsScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply("Redirecting to settings...", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Set Slippage", callback_data: "SET_SLIPPAGE" }],
          [{ text: "Back", callback_data: "START" }],
        ],
      },
    });
  }
}
