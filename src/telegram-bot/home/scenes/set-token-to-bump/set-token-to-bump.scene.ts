import { Scene, SceneEnter, Ctx, On, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { HomeAction } from "../../constants";
import { SetTokenToBumpViewService } from "./set-token-to-bump-view.service";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { MintDto } from "../../../shared/dto/mint.dto";
import { HomeService } from "../../home.service";
import { toSol } from "../../../../core/solana";
import { DEFAULT_REPLY_OPTIONS } from "../../../shared/constants";
import { PricingService } from "../../../pricing/pricing.service";

@Scene(HomeAction.SET_TOKEN_TO_BUMP)
export class SetTokenToBumpScene {
  constructor(
    private readonly viewService: SetTokenToBumpViewService,
    private readonly homeService: HomeService,
    private readonly pricingService: PricingService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();

    const promptMessage = this.viewService.getPromptMsg();
    await ctx.reply(promptMessage);
  }

  @On("text")
  async onTokenToBumpInput(
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
    // Only for testing purposes
    if (mintInput.mint === "test") {
      mintInput.mint =
        "https://pump.fun/coin/3aD5oXNmDKGpkE7DfK1ceaLWBL8o24zyRoMYBcbWpump";
    }
    const mintDto: MintDto = plainToInstance(MintDto, mintInput);
    const errors = await validate(mintDto);

    if (errors.length) {
      // === Invalid input ===
      const promptMessage = this.viewService.getPromptMsg();
      await ctx.reply(`Invalid input. ${promptMessage}`);
      return;
    }

    const mint = mintDto.mint;
    const user = ctx.session.user;
    const userBalance = await this.homeService.getBalance(user.publicKey);
    const requiredBalance = this.pricingService.calculateRequiredBalanceFor(
      "PAY_PER_BUMP",
      user,
      mint
    );
    const hasSufficientBalance = userBalance >= requiredBalance;

    if (!hasSufficientBalance) {
      // === Insufficient Balance ===
      const bumpPrice = this.pricingService.calculateBumpPrice(user, mint);
      const message = this.viewService.getInsufficientBalanceMsg(
        toSol(requiredBalance),
        toSol(bumpPrice)
      );
      await ctx.reply(message, { ...DEFAULT_REPLY_OPTIONS });
      return;
    }

    // === Start Bumping ===
    ctx.scene.enter(HomeAction.START_BUMPING, { mint });
  }
}
