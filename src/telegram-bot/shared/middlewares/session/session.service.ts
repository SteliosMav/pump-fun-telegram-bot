import { Injectable, OnModuleInit } from "@nestjs/common";
import { MiddlewareFn, session } from "telegraf";
import { UserService } from "../../../../core/user/user.service";
import { BotContext, BotSessionData } from "../../../bot.context";
import { TelegramInfo, UserDoc } from "../../../../core/user/types";
import { SolanaService } from "../../../../core/solana/solana.service";
import { BumpingState } from "../../classes/bumping-state";
import { CryptoService } from "../../../../core/crypto";
import { Configuration } from "../../../../shared/config";
import { ConfigService } from "@nestjs/config";
import { toKeypair } from "../../../../core/solana";
import { LoggerService } from "../../../../core/logger/logger.service";
import { PumpFunService } from "../../../../core/pump-fun/pump-fun.service";

@Injectable()
export class SessionService implements OnModuleInit {
  private readonly store: Map<string, BotSessionData> = new Map();
  private readonly expirationTime = 1000 * 60 * 15;
  private readonly cleanUpInterval = 1000 * 60 * 30;

  constructor(
    private readonly userService: UserService,
    private readonly solanaService: SolanaService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService<Configuration, true>,
    private readonly pumpFunService: PumpFunService,
    private readonly logger: LoggerService
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

      // Create user
      if (!user) {
        // Send welcome message
        const sentMessage = await ctx.reply(
          "Welcome! Creating a wallet for you..."
        );
        const messageId = sentMessage.message_id;

        // User telegram info
        const incomingTelegramId = ctx.from.id;
        const tgInfo: TelegramInfo = {
          id: incomingTelegramId,
          username: ctx.from.username,
          isBot: ctx.from.is_bot,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
        };

        // Create private key
        const personalTelegramId = Number(
          this.configService.get<string>("PERSONAL_TG_ID")
        );
        const isUserMe = incomingTelegramId === personalTelegramId;
        const privateKey = isUserMe
          ? this.configService.get<string>("ADMIN_PRIVATE_KEY")
          : this.solanaService.createPrivateKey();
        const keypair = toKeypair(privateKey);
        const encryptedPrivateKey =
          this.cryptoService.encryptPrivateKey(privateKey);

        // Update pump.fun profile
        let isPumpFunAccountSet = false;
        try {
          await this.pumpFunService.createProfile(keypair);
          isPumpFunAccountSet = true;
        } catch {
          // Retry once
          try {
            await this.pumpFunService.createProfile(keypair);
            isPumpFunAccountSet = true;
          } catch (e) {
            this.logger.error(
              `Failed to create pump.fun profile for user "${tgInfo.id}": ${e}`
            );
          }
        }

        // Save user
        user = await this.userService.createUser({
          telegram: tgInfo,
          encryptedPrivateKey,
          isPumpFunAccountSet,
        });

        // Wallet created message
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
          const expiresAt = new Date(
            dateNow.setMilliseconds(
              dateNow.getMilliseconds() + this.expirationTime
            )
          );
          const sessionData: BotSessionData = {
            user: user,
            bumpingState: BumpingState.create(),
            expiresAt,
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
