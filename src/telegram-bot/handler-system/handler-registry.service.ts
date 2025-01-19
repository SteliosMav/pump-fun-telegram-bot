import { Injectable } from "@nestjs/common";
import TelegramBot from "node-telegram-bot-api";

@Injectable()
export class HandlerRegistry {
  private readonly handlers = new Map<
    string,
    (ctx: TelegramBot.Message) => Promise<void>
  >();

  registerHandler(
    command: string,
    handler: (ctx: TelegramBot.Message) => Promise<void>
  ): void {
    this.handlers.set(command, handler);
    console.log(`Registered handler for command: ${command}`);
  }

  getHandler(
    command: string
  ): ((ctx: TelegramBot.Message) => Promise<void>) | undefined {
    return this.handlers.get(command);
  }
}
