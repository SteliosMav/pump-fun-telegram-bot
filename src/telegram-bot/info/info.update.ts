import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SharedAction, SharedCommand } from "../shared/constants";

@Update()
export class InfoUpdate {
  @Command(SharedCommand.INFO)
  async onRenderInfo(@Ctx() ctx: BotContext) {
    ctx.scene.enter(SharedAction.RENDER_INFO);
  }

  @Action(SharedAction.GO_TO_INFO)
  async onGoToInfo(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SharedAction.GO_TO_INFO);
  }
}
