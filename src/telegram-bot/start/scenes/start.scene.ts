import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";

@Scene("start")
export class StartScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply("Welcome to the bot! Press a button to proceed.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Start Bumping", callback_data: "START_BUMPING" }],
          [{ text: "Settings", callback_data: "SETTINGS" }],
        ],
      },
    });
  }
}
