import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { SettingsViewService } from "./settings-view.service";

@Scene(SharedAction.GO_TO_SETTINGS)
export class GoToSettingsScene {
  constructor(private readonly settingsViewService: SettingsViewService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const message = this.settingsViewService.getMarkdown(user);
    const buttons = this.settingsViewService.getButtons(user);

    await ctx.editMessageText(message, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
