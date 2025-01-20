import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import TelegramBot from "node-telegram-bot-api";
import { HandlerRegistry } from "./handler-system/handler-registry.service";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "../shared/config";

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private bot: TelegramBot;

  constructor(
    private readonly configService: ConfigService<Configuration>,
    private readonly handlerRegistry: HandlerRegistry
  ) {
    this.bot = new TelegramBot(this.configService.get("TELEGRAM_BOT_TOKEN")!, {
      polling: true,
    });
  }

  async onModuleInit() {
    this.bot.on("message", async (msg) => {
      const command = msg.text || "";
      const handler = this.handlerRegistry.getHandler(command);

      if (handler) {
        await handler(msg);
      } else {
        this.bot.sendMessage(msg.chat.id, "Unknown command.");
      }
    });
  }

  async onModuleDestroy() {
    this.bot.stopPolling();
  }
}
