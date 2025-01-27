import { Action, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { SettingsAction } from "./constants";
import { SharedAction } from "../shared/constants";

@Update()
export class SettingsUpdate {
  @Action(SharedAction.GO_TO_HOME)
  async onGoToStart(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SharedAction.GO_TO_HOME);
  }

  @Action(SettingsAction.SET_AMOUNT)
  async onSetAmount(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SettingsAction.SET_AMOUNT);
  }

  @Action(SettingsAction.SET_SLIPPAGE)
  async onSetSlippage(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SettingsAction.SET_SLIPPAGE);
  }

  @Action(SettingsAction.SET_INTERVAL)
  async onSetInterval(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SettingsAction.SET_INTERVAL);
  }

  @Action(SettingsAction.SET_PRIORITY_FEE)
  async onSetPriorityFee(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SettingsAction.SET_PRIORITY_FEE);
  }

  @Action(SettingsAction.SET_LIMIT)
  async onSetLimit(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(SettingsAction.SET_LIMIT);
  }
}
