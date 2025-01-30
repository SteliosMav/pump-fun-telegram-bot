import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { SettingsViewService } from "./settings-view.service";

@Scene(SharedAction.RENDER_SETTINGS)
export class RenderSettingsScene {
  constructor(private readonly settingsViewService: SettingsViewService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
    const message = this.settingsViewService.getMessage(user);
    const buttons = this.settingsViewService.getButtons(user);

    await ctx.reply(message, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
