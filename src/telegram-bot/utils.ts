// Aliasing the User type from "node-telegram-bot-api"
import TelegramBot, { User as TelegramUser } from "node-telegram-bot-api";
import { User as CustomUser } from "src/users/types";

export function getUserByMsg(
  msg: TelegramUser,
  privateKey: string
): CustomUser {
  const user: CustomUser = {
    telegramId: msg.id,
    privateKey,
    firstName: msg.first_name,
    isBot: msg.is_bot,
    pumpsCounter: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastName: msg.last_name,
    username: msg.username,
  };
  return user;
}
