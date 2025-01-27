import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { SettingsAction } from "../../constants";
import { LimitDto } from "./limit.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { SettingsService } from "../../settings.service";
import { SharedAction } from "../../../shared/constants";

@Scene(SettingsAction.SET_LIMIT)
export class LimitScene {
  private readonly min = validationRules.bumpSettings.limit.min;
  private readonly max = validationRules.bumpSettings.limit.max;

  constructor(private readonly settingsService: SettingsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply(`Choose bumps limit from ${this.min} to ${this.max}:`);
  }

  @On("text")
  async onLimitInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    // Parse and validate input
    const limitInput: LimitDto = {
      limit: parseFloat(ctx.message.text),
    };
    const limitDto: LimitDto = plainToInstance(LimitDto, limitInput);
    const errors = await validate(limitDto);

    if (errors.length) {
      // Provide detailed feedback to the user
      await ctx.reply(
        `Invalid input. Limit must be a number from ${this.min} to ${this.max}. Please try again.`
      );
    } else {
      // Update user's limit
      await this.settingsService.updateLimit(ctx.session, limitDto.limit);

      // Render settings page
      ctx.scene.enter(SharedAction.RENDER_SETTINGS);
    }
  }
}
