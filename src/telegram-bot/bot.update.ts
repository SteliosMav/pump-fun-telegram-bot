import { Action, Ctx, Command, InjectBot, On, Update } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { BotContext } from "./bot.context";
import { Injectable } from "@nestjs/common";

@Update()
@Injectable()
export class BotUpdate {
  constructor(@InjectBot() private readonly bot: Telegraf<BotContext>) {}

  @On("message")
  async onMessage(@Ctx() ctx: BotContext) {
    console.log("Fallback message handler triggered:", ctx.message);
    await ctx.reply("Message received!");
  }

  @Command("start")
  async onStart(@Ctx() ctx: BotContext) {
    console.log("Command received");
    await ctx.reply("Welcome to the bot! Press a button to proceed.");
    await ctx.reply("Choose an action:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Set Slippage", callback_data: "SET_SLIPPAGE" }],
        ],
      },
    });
  }

  @Action("SET_SLIPPAGE")
  async onSetSlippage(@Ctx() ctx: BotContext) {
    console.log("Action received");
    await ctx.reply("Enter the slippage percentage (e.g., 2):");
    ctx.session.lastCallback = "SET_SLIPPAGE";
    ctx.scene.enter("slippageScene"); // Redirect to the slippage scene
  }

  @On("text")
  async onText(@Ctx() ctx: BotContext) {
    console.log("Text received");
    console.log("Text received:", ctx.message);
  }
}
