import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { SettingsAction } from "../../constants";
import { AmountDto } from "./amount.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { SettingsService } from "../../settings.service";
import { SharedAction } from "../../../shared/constants";
import _ from "lodash";

@Scene(SettingsAction.SET_AMOUNT)
export class AmountScene {
  constructor(private readonly settingsService: SettingsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply("Enter the amount in SOL (e.g. 0.015):");
  }

  @On("text")
  async onAmountInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    // Parse and validate input
    const amountInput: AmountDto = {
      amount: _.floor(parseFloat(ctx.message.text), 4), // Keep 4 decimal digits
    };
    const amountDto: AmountDto = plainToInstance(AmountDto, amountInput);
    const errors = await validate(amountDto);

    if (errors.length) {
      // Provide detailed feedback to the user
      const min = validationRules.bumpSettings.amount.min;
      const max = validationRules.bumpSettings.amount.max;

      await ctx.reply(
        `Invalid input. Amount must be a number between ${min} and ${max}. Please try again.`
      );
    } else {
      // Update user's amount
      await this.settingsService.updateAmount(ctx.session, amountDto.amount);

      // Render settings page
      ctx.scene.enter(SharedAction.RENDER_SETTINGS);
    }
  }
}
