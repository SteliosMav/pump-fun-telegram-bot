import { Scene, SceneEnter, Ctx, On } from "nestjs-telegraf";
import { HomeService } from "../../home.service";
import { BotContext } from "../../../bot.context";
import { HomeAction } from "../../constants";
import { DEFAULT_REPLY_OPTIONS, SharedAction } from "../../../shared/constants";
import { StartBumpingSceneCtx } from "./types";
import { StartBumpingViewService } from "./start-bumping-view.service";

@Scene(HomeAction.START_BUMPING)
export class StartBumpingScene {
  constructor(
    private readonly homeService: HomeService,
    private readonly viewService: StartBumpingViewService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: StartBumpingSceneCtx) {
    const { mint } = ctx.scene.state;
    const { bumpingState: state } = ctx.session;

    // Reset previous bumping state
    state.reset();

    // Start Bumping
    const startMsg = this.viewService.getBumpingStartedMsg();
    const keyboard = this.viewService.getCancelButton();
    const { message_id: bumpingStartedMsgId } = await ctx.reply(startMsg, {
      ...DEFAULT_REPLY_OPTIONS,
      reply_markup: { inline_keyboard: keyboard },
    });
    ctx.session.botLastMessageId = bumpingStartedMsgId;
    await this.homeService.startBumping(ctx.session, mint);

    // Bump status response
    const responseMsg = this.viewService.getBumpDataMsg(state);
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.session.botLastMessageId,
      undefined,
      responseMsg,
      {
        ...DEFAULT_REPLY_OPTIONS,
      }
    );

    // Redirect
    await ctx.scene.enter(SharedAction.RENDER_HOME);
  }

  /**
   * Cancel bumping if user interacts with the bot while the bumping is active.
   */
  @On(["text", "callback_query"])
  async onUserInteraction(@Ctx() ctx: BotContext) {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }
    await this.cancelBumping(ctx);
  }

  private async cancelBumping(ctx: BotContext) {
    const hasCallbackQueryData =
      ctx.callbackQuery && "data" in ctx.callbackQuery;
    const userRequested =
      hasCallbackQueryData && ctx.callbackQuery.data === "CANCEL_BUMPING";
    ctx.session.bumpingState.cancelBy(
      userRequested ? "USER_REQUESTED" : "USER_ACTIVITY"
    );

    if (!ctx.session.botLastMessageId) {
      throw new Error(
        "Bot last message ID is missing when trying to cancel bumping."
      );
    }

    const message = this.viewService.getCancelingBumpingMsg();
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.session.botLastMessageId,
      undefined,
      message,
      { ...DEFAULT_REPLY_OPTIONS }
    );
    ctx.scene.leave();
  }
}
