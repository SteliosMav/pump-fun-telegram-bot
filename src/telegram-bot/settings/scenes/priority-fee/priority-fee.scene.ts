import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { SettingsAction } from "../../constants";
import { PriorityFeeDto } from "./priority-fee.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { SettingsService } from "../../settings.service";
import { SharedAction } from "../../../shared/constants";
import _ from "lodash";

@Scene(SettingsAction.SET_PRIORITY_FEE)
export class PriorityFeeScene {
  private readonly min = validationRules.bumpSettings.priorityFee.min;
  private readonly max = validationRules.bumpSettings.priorityFee.max;

  constructor(private readonly settingsService: SettingsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply(`Enter the priority fee in SOL (min: ${this.min}):`);
  }

  @On("text")
  async onPriorityFeeInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    // Parse and validate input
    const decimalsToKeep = this.min.toString().replace(".", "").length - 1;
    const priorityFeeInput: PriorityFeeDto = {
      priorityFee: _.floor(parseFloat(ctx.message.text), decimalsToKeep), // Keep 5 decimal digits
    };
    const priorityFeeDto: PriorityFeeDto = plainToInstance(
      PriorityFeeDto,
      priorityFeeInput
    );
    const errors = await validate(priorityFeeDto);

    if (errors.length) {
      // Provide detailed feedback to the user

      await ctx.reply(
        `Invalid input. Priority fee must be a number between ${this.min} and ${this.max}. Please try again.`
      );
    } else {
      // Update user's priorityFee
      await this.settingsService.updatePriorityFee(
        ctx.session,
        priorityFeeDto.priorityFee
      );

      // Render settings page
      ctx.scene.enter(SharedAction.RENDER_SETTINGS);
    }
  }
}
