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
  constructor(private readonly settingsService: SettingsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply("Choose frequency from 1 to 60 seconds (e.g. 10):");
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
    console.log(intervalDto);
    const errors = await validate(intervalDto);
    console.log(errors);

    if (errors.length) {
      // Provide detailed feedback to the user
      const min = validationRules.bumpSettings.intervalInSeconds.min;
      const max = validationRules.bumpSettings.intervalInSeconds.max;

      await ctx.reply(
        `Invalid input. Interval must be a number from ${min} to ${max}. Please try again.`
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
