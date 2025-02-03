import { Action, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SharedAction } from "../shared/constants";

@Update()
export class InfoUpdate {
  @Action(SharedAction.GO_TO_INFO)
  async onGoToInfo(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SharedAction.GO_TO_INFO);
  }
}
