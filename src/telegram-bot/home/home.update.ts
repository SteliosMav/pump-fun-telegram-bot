import { Command, Action, Ctx, Update, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";

@Update()
export class HomeUpdate {
  @Command("start")
  async onStart(@Ctx() ctx: BotContext, @Next() next: () => Promise<void>) {
    ctx.scene.enter("home");
    // await next(); // Pass control to other handlers if necessary
  }

  @Action("START_BUMPING")
  async onStartBumping(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter("startBumping");
  }

  @Action("SETTINGS")
  async onSettings(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter("settings");
  }
}
