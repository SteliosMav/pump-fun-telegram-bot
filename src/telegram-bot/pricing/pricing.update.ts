import { Command, Action, Ctx, Update, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SharedAction, SharedCommand } from "../shared/constants";
import { PricingAction } from "./constants";

@Update()
export class PricingUpdate {
  @Command(SharedCommand.START)
  async onGoToStart(@Ctx() ctx: BotContext, @Next() next: () => Promise<void>) {
    ctx.scene.enter(SharedAction.RENDER_HOME);
  }

  @Action(PricingAction.BUY_SERVICE_PASS)
  async onBuyServicePass(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(PricingAction.BUY_SERVICE_PASS);
  }

  @Action(PricingAction.BUY_TOKEN_PASS)
  async onStartBumping(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(PricingAction.BUY_TOKEN_PASS);
  }

  @Action(PricingAction.USE_TOKEN_PASS)
  async onUseTokenPass(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(PricingAction.USE_TOKEN_PASS);
  }

  @Action(SharedAction.GO_TO_SETTINGS)
  async onGoToSettings(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SharedAction.GO_TO_SETTINGS);
  }
}
