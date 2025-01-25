import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";
import { SettingsAction } from "../constants";
import { SlippagePercentageDto } from "./slippage-percentage.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { validationRules } from "../../../shared/validation-rules";
import { SettingsService } from "../settings.service";
import { SharedAction } from "../../shared/constants";

/**
 * @WARNING test nestjs default filter exemption to see if it works.
 */

@Scene(SettingsAction.SET_SLIPPAGE)
export class SlippageScene {
  constructor(private readonly settingsService: SettingsService) {}

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
    const slippageInput: SlippagePercentageDto = {
      slippagePercentage: parseFloat(ctx.message.text),
    };
    const slippageDto: SlippagePercentageDto = plainToInstance(
      SlippagePercentageDto,
      slippageInput
    );
    const errors = await validate(slippageDto);

    if (errors.length) {
      // Provide detailed feedback to the user
      const minPercentage = validationRules.bumpSettings.slippage.min * 100;
      const maxPercentage = validationRules.bumpSettings.slippage.max * 100;

      await ctx.reply(
        `Invalid input. Slippage must be an integer between ${minPercentage} and ${maxPercentage}. Please try again.`
      );
    } else {
      const { slippagePercentage } = slippageDto;
      const slippageDecimal = slippagePercentage / 100;

      // Update user's slippage
      await this.settingsService.updateSlippage(ctx.session, slippageDecimal);

      // Render settings page
      ctx.scene.enter(SharedAction.RENDER_SETTINGS);
    }
  }
}
