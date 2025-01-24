import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { BOT_WEBSITE_URL } from "../../../shared/constants";
import { SharedCallbackType } from "../../shared/constants";
import { HomeCallbackType } from "../constants";
import { refreshBalanceBtn } from "../../shared/view/buttons";

const START_BUMPING_BTN_WORDING = "Start Bumping";

/**
 * @WARNING improvements:
 * 1) Separate view logic from the scene logic. Keep only the configuration here.
 * 2) Use enum for scene names.
 * 3) Add user's balance to the view. Consider storing it in the session and updating it
 *    after (a few seconds) the user bumps a meme coin.
 */

@Scene("home")
export class HomeScene {
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
💎  *Service pass:*  ${
        user.hasServicePass
          ? "*Congratulations! Enjoy service fee FREE bumps!*"
          : "_(coming soon!)_"
      }

Reach out to us:
🌐 [ezpump.fun](${BOT_WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)  ❓@ezpumpsupport`,
      {
        parse_mode: "Markdown",
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: {
          inline_keyboard: [
            [
              refreshBalanceBtn(),
              {
                text: `⚙️  Settings`,
                callback_data: SharedCallbackType.SETTINGS,
              },
            ],
            [
              {
                text: "🎟️  Token Pass",
                callback_data: SharedCallbackType.TOKEN_PASS,
              },
              {
                text: `🔥  ${START_BUMPING_BTN_WORDING}`,
                callback_data: HomeCallbackType.SET_TOKEN,
              },
            ],
          ],
        },
      }
    );
  }
}
