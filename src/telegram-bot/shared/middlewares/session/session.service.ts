import { Injectable, OnModuleInit } from "@nestjs/common";
import { MiddlewareFn, session } from "telegraf";
import { UserService } from "../../../../core/user/user.service";
import { BotContext, BotSessionData } from "../../../bot.context";
import { TelegramInfo, UserDoc } from "../../../../core/user/types";
import { SolanaService } from "../../../../core/solana/solana.service";
import { BumpingState } from "../../classes/bumping-state";

@Injectable()
export class SessionService implements OnModuleInit {
  private readonly store: Map<string, BotSessionData> = new Map();
  private readonly expirationTime = 1000 * 60 * 15;
  private readonly cleanUpInterval = 1000 * 60 * 30;

  constructor(
    private readonly userService: UserService,
    private readonly solanaService: SolanaService
  ) {}

  onModuleInit() {
    // === Clean Expired Sessions ===
    setInterval(() => this.cleanExpiredSessions(), this.cleanUpInterval);
  }

  getMiddleware(): MiddlewareFn<BotContext> {
    return async (ctx, next) => {
      // === Find User ===
      let user: UserDoc | null;
      const sessionKey = `${ctx.from.id}:${ctx.chat.id}`; // Check if native method exists in telegraf for getting the session key
      const userSession = this.store.get(sessionKey);
      if (userSession && userSession.expiresAt > new Date()) {
        user = userSession.user;
      } else {
        user = await this.userService.getUserByTgId(ctx.from.id);
      }

      if (!user) {
        // === Create User ===
        const sentMessage = await ctx.reply(
          "Welcome! Creating a wallet for you..."
        );
        const messageId = sentMessage.message_id;

        const tgInfo: TelegramInfo = {
          id: ctx.from.id,
          username: ctx.from.username,
          isBot: ctx.from.is_bot,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
        };
        user = await this.userService.createUser(
          tgInfo,
          this.solanaService.createEncryptedPrivateKey()
        );

        await ctx.telegram.editMessageText(
          ctx.chat.id,
          messageId,
          undefined,
          "Your wallet has been created!"
        );
      }

      const sessionMiddlewareFn = session({
        // === New Session Process ===
        defaultSession: (): BotSessionData => {
          const dateNow = new Date();
          const expirationDate = new Date(
            dateNow.setMilliseconds(
              dateNow.getMilliseconds() + this.expirationTime
            )
          );
          const sessionData: BotSessionData = {
            user: user,
            bumpingState: BumpingState.create(),
            expiresAt: expirationDate,
            botLastMessageId: null,
          };
          return sessionData;
        },
        // === Storage To Use ===
        store: this.store,
      });
      sessionMiddlewareFn(ctx, next);
    };
  }

  private cleanExpiredSessions() {
    const now = new Date();
    for (const [key, value] of this.store.entries()) {
      if (value.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }
}
