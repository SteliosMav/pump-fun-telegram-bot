import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { SettingsAction } from "../../constants";
import { IntervalInSecondsDto } from "./interval.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { SettingsService } from "../../settings.service";
import { SharedAction } from "../../../shared/constants";

@Scene(SettingsAction.SET_INTERVAL)
export class IntervalScene {
  private readonly min = validationRules.bumpSettings.intervalInSeconds.min;
  private readonly max = validationRules.bumpSettings.intervalInSeconds.max;

  constructor(private readonly settingsService: SettingsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply(
      `Choose frequency from ${this.min} to ${this.max} seconds:`
    );
  }

  @On("text")
  async onIntervalInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    // Parse and validate input
    const intervalInput: IntervalInSecondsDto = {
      intervalInSeconds: parseFloat(ctx.message.text),
    };
    const intervalDto: IntervalInSecondsDto = plainToInstance(
      IntervalInSecondsDto,
      intervalInput
    );
    const errors = await validate(intervalDto);

    if (errors.length) {
      // Provide detailed feedback to the user
      await ctx.reply(
        `Invalid input. Interval must be a number from ${this.min} to ${this.max}. Please try again.`
      );
    } else {
      // Update user's interval
      await this.settingsService.updateInterval(
        ctx.session,
        intervalDto.intervalInSeconds
      );

      // Render settings page
      ctx.scene.enter(SharedAction.RENDER_SETTINGS);
    }
  }
}
