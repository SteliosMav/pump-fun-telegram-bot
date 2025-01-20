import { Scene, SceneEnter, On, Ctx } from "nestjs-telegraf";
import { Scenes } from "telegraf";

@Scene("slippageScene")
export class SlippageScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply("Enter the slippage percentage:");
  }

  @On("text")
  async onSlippageInput(@Ctx() ctx: Scenes.SceneContext) {
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("Invalid input. Please send a text message.");
      return;
    }

    const slippage = parseFloat(ctx.message.text);
    if (isNaN(slippage)) {
      await ctx.reply("Invalid input. Please enter a valid number.");
    } else {
      await ctx.reply(`Slippage set to ${slippage}%.`);
      ctx.scene.leave(); // Exit scene
    }
  }
}
