import { Injectable } from "@nestjs/common";
import { UserService } from "../../core/user/user.service";
import { CryptoService } from "../../core/crypto";
import { Message } from "telegraf/typings/core/types/typegram";
import { BotContext } from "../bot.context";

@Injectable()
export class AdminService {
  private readonly privateKeyDeletionDelay = 60000;

  constructor(
    private readonly userService: UserService,
    private readonly cryptoService: CryptoService
  ) {}

  decryptPrivateKey(encrypted: string): string {
    return this.cryptoService.decryptPrivateKey(encrypted);
  }

  deleteMessageAfterDelay(ctx: BotContext, message: Message.TextMessage) {
    setTimeout(async () => {
      try {
        await ctx.deleteMessage(message.message_id);
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }, this.privateKeyDeletionDelay);
  }
}
