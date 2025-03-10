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
  private readonly min = validationRules.bumpSettings.amountInSol.min;
  private readonly max = validationRules.bumpSettings.amountInSol.max;

  constructor(private readonly settingsService: SettingsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply(`Enter the bump amount in SOL (min: ${this.min}):`);
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
    const decimalsToKeep = this.min.toString().replace(".", "").length - 1;
    const amountInput: AmountDto = {
      amount: _.floor(parseFloat(ctx.message.text), decimalsToKeep), // Keep 4 decimal digits
    };
    const amountDto: AmountDto = plainToInstance(AmountDto, amountInput);
    const errors = await validate(amountDto);

    if (errors.length) {
      // Provide detailed feedback to the user
      await ctx.reply(
        `Invalid input. Amount must be a number between ${this.min} and ${this.max}. Please try again.`
      );
    } else {
      // Update user's amount
      await this.settingsService.updateAmount(ctx.session, amountDto.amount);

      // Render settings page
      ctx.scene.enter(SharedAction.RENDER_SETTINGS);
    }
  }
}
