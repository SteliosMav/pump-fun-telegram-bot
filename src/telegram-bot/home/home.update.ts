import { Command, Action, Ctx, Update, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SharedAction, SharedCommand } from "../shared/constants";
import { HomeAction } from "./constants";

@Update()
export class HomeUpdate {
  @Command(SharedCommand.START)
  async onRenderStart(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    ctx.scene.enter(SharedAction.RENDER_HOME);
  }

  @Action(SharedAction.GO_TO_HOME)
  async onGoToStart(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SharedAction.GO_TO_HOME);
  }

  @Action(HomeAction.START_BUMPING)
  async onStartBumping(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(HomeAction.START_BUMPING);
  }
}
