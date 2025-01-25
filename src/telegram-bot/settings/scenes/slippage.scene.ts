import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { SettingsAction } from "../constants";
import { SlippageDto } from "./slippage.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { validationRules } from "../../../shared/validation-rules";

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
    // Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    // Parse and validate input
    const slippageInput: SlippageDto = {
      slippage: parseFloat(ctx.message.text),
    };
    const slippageDto: SlippageDto = plainToInstance(
      SlippageDto,
      slippageInput
    );
    const errors = await validate(slippageDto);

    if (errors.length) {
      // Provide detailed feedback to the user
      const { slippage } = validationRules.bumpSettings;
      const minPercentage = slippage.min * 100;
      const maxPercentage = slippage.max * 100;

      await ctx.reply(
        `Invalid input. Slippage must be an integer between ${minPercentage} and ${maxPercentage}. Please try again.`
      );
    } else {
      const { slippage } = slippageDto;

      // Save user's slippage
      // ...

      await ctx.reply(`Slippage set to ${slippage}%.`);
      ctx.scene.leave();
    }
  }
}
