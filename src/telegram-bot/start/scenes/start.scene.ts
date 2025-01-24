import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { BOT_WEBSITE_URL } from "../../../shared/constants";

const START_BUMPING_BTN_WORDING = "Start Bumping";

@Scene("start")
export class StartScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const balance = "(not provided)";
    await ctx.reply(
      `💳   *Wallet*: \`${user.publicKey}\`
💰   *Balance*: \`${balance}\` SOL

*To get started:*
*1)* Deposit some *SOL* into your *wallet* address shown above
*2)* Press the *${START_BUMPING_BTN_WORDING}* button
*3)* Enter meme coin's *CA* or *URL* and enjoy bumping! 🔥
${user.hasServicePass ? "" : `\n🎟️  *Token pass:*  ${user.tokenPassesLeft}`}

Reach out to us:
🌐 [ezpump.fun](${BOT_WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)  ❓@ezpumpsupport`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: START_BUMPING_BTN_WORDING,
                callback_data: "START_BUMPING",
              },
            ],
            [{ text: "Settings", callback_data: "SETTINGS" }],
          ],
        },
      }
    );
  }
}
