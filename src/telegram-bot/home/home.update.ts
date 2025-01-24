import { Command, Action, Ctx, Update, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SharedAction, SharedCommand } from "../shared/constants";
import { HomeAction } from "./constants";

@Update()
export class HomeUpdate {
  @Command(SharedCommand.START)
  async onStart(@Ctx() ctx: BotContext, @Next() next: () => Promise<void>) {
    ctx.scene.enter(SharedAction.HOME);
    // await next(); // Pass control to other handlers if necessary
  }

  @Action(HomeAction.START_BUMPING)
  async onStartBumping(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(HomeAction.START_BUMPING);
  }

  @Action(SharedAction.SETTINGS)
  async onSettings(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SharedAction.SETTINGS);
  }
}
