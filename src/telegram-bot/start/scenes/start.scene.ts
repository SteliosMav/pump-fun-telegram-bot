import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { BOT_WEBSITE_URL } from "../../../shared/constants";
import { UserDoc } from "../../../core/user/types";

// const md = (user: UserDoc) => `💳   *Wallet*: \`${publicKey}\`
// 💰   *Balance*: \`${balance}\` SOL

// *To get started:*
// *1)* Deposit some *SOL* into your *wallet* address shown above
// *2)* Press the *${START_BUMPING_BTN_WORDING}* button
// *3)* Enter meme coin's *CA* or *URL* and enjoy bumping! 🔥
// ${hasServicePass ? "" : `\n🎟️  *Token pass:*  ${tokenPassLeft}`}

// Reach out to us:
// 🌐 [ezpump.fun](${BOT_WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)  ❓@ezpumpsupport`;

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
