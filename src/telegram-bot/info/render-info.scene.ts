import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../shared/constants";
import { InfoViewService } from "./info-view.service";

@Scene(SharedAction.RENDER_INFO)
export class RenderInfoScene {
  constructor(private readonly viewService: InfoViewService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const message = this.viewService.getMessage();
    const buttons = this.viewService.getButtons();

    await ctx.reply(message, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
