import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { SettingsViewService } from "./settings-view.service";

@Scene(SharedAction.SETTINGS)
export class SettingsScene {
  constructor(private readonly settingsViewService: SettingsViewService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;

    await ctx.reply(this.settingsViewService.getMarkdown(user), {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: this.settingsViewService.getButtons(user),
      },
    });
  }
}
