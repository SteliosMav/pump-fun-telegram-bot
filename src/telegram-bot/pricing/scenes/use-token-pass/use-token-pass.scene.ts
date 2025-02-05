import { Scene, SceneEnter, Ctx, On, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../../../shared/constants";
import { PricingAction } from "../../constants";
import { PricingService } from "../../pricing.service";
import { UseTokenPassViewService } from "./use-token-pass-view.service";
import { MintDto } from "../../../shared/dto/mint.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Scene(PricingAction.USE_TOKEN_PASS)
export class UseTokenPassScene {
  constructor(
    private readonly pricingService: PricingService,
    private readonly viewService: UseTokenPassViewService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    const user = ctx.session.user;

    if (!user.tokenPassesLeft) {
      // === Insufficient Token-Passes ===
      const message = this.viewService.getInsufficientTokenPassesMsg();
      await ctx.reply(message, { ...DEFAULT_REPLY_OPTIONS });
      return;
    }

    const message = this.viewService.getPromptMsg();
    await ctx.reply(message);
  }

  @On("text")
  async onTokenToUseInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // === Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    // === Parse user's input ===
    const mintInput: MintDto = {
      mint: ctx.message.text,
    };
    const mintDto: MintDto = plainToInstance(MintDto, mintInput);
    const errors = await validate(mintDto);

    if (errors.length) {
      // === Invalid input ===
      const promptMessage = this.viewService.getPromptMsg();
      await ctx.reply(`Invalid input. ${promptMessage}`);
      return;
    }

    // === Update User ===
    const { mint } = mintDto;
    await this.pricingService.useTokenPass(ctx.session, mint);

    // === Success Message ===
    const message = this.viewService.getSuccessMsg();
    await ctx.reply(message, { ...DEFAULT_REPLY_OPTIONS });

    // === Redirect To Pricing ===
    ctx.scene.enter(SharedAction.RENDER_PRICING);
  }
}
