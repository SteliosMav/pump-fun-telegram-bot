import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { SettingsAction } from "../constants";

@Scene(SettingsAction.SET_SLIPPAGE)
export class SlippageScene {
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply("Enter the slippage percentage (e.g., 2):");
  }

  @On("text")
  async onSlippageInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // If the input starts with a command, allow it to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    const slippage = parseFloat(ctx.message.text);
    if (isNaN(slippage)) {
      await ctx.reply("Invalid input. Please enter a valid number.");
    } else {
      await ctx.reply(`Slippage set to ${slippage}%.`);
      ctx.scene.leave();
    }
  }
}
