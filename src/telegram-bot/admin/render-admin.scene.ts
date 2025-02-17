import { Scene, SceneEnter, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { DEFAULT_REPLY_OPTIONS } from "../shared/constants";
import { AdminAction } from "./constants";
import { AdminViewService } from "./admin-view.service";

@Scene(AdminAction.RENDER_ADMIN)
export class RenderAdminScene {
  constructor(private readonly viewService: AdminViewService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;
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
