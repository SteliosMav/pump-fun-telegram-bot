import { Scene, SceneEnter, On, Ctx } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";

@Scene("slippage")
export class SlippageScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply("Enter the slippage percentage (e.g., 2):");
  }

  @On("text")
  async onSlippageInput(@Ctx() ctx: BotContext) {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("Invalid input. Please send a text message.");
      return;
    }

    const slippage = parseFloat(ctx.message.text);
    if (isNaN(slippage)) {
      await ctx.reply("Invalid input. Please enter a valid number.");
    } else {
      // ctx.session.slippage = slippage / 100;
      await ctx.reply(`Slippage set to ${slippage}%.`);
      ctx.scene.leave(); // Exit the scene
    }
  }
}
