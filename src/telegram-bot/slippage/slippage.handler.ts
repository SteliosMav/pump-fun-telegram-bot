import { Injectable } from "@nestjs/common";
import { Action, Ctx } from "nestjs-telegraf";
import { BotContext } from "../bot.context";

@Injectable()
export class SlippageHandler {
  @Action("SET_SLIPPAGE")
  async handleSetSlippage(@Ctx() ctx: BotContext) {
    await ctx.reply("Enter the slippage percentage (e.g., 2):");
    ctx.session.lastCallback = "SET_SLIPPAGE";
    ctx.scene.enter("slippageScene");
  }
}
