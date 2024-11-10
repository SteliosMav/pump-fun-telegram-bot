import { User } from "src/users/types";
import { BasicHandlerArguments, CallbackType } from "../types";
import TelegramBot from "node-telegram-bot-api";
import { UserService } from "src/users/user.service";
import { Database } from "sqlite3";
import { SolanaService } from "src/solana/solana.service";
import { USER_DEFAULT_VALUES, USER_FRIENDLY_ERROR_MESSAGE } from "src/config";
import { getStartingInlineKeyboard } from "../utils";

export async function startController({ bot, msg }: BasicHandlerArguments) {
  // Initialize dependencies
  const db = new Database("telegram_bot.db");
  const userService = new UserService(db);
  const solanaService = new SolanaService();

  // User should have already been validated by the middleware at this point
  const from = msg.from as TelegramBot.User;
  let user = await userService.getUser(from.id);

  // Incase of new user, it takes time to respond, thus a loading message is sent
  let loadingMessage: TelegramBot.Message | undefined;

  // New user
  if (!user) {
    // Send initial "loading" message
    loadingMessage = await bot.sendMessage(
      msg.chat.id,
      "Setting up your personal wallet, please wait a moment..."
    );

    // Create new wallet for new user
    const privateKey = await solanaService.createSolanaAccount();

    if (!privateKey) {
      console.error("Error creating Solana account");
      bot.sendMessage(msg.chat.id, USER_FRIENDLY_ERROR_MESSAGE);
      return;
    }

    // Create new user
    user = _userByTelegramUser(from, privateKey);
    const newUserRes = await userService.create(user);

    if (!newUserRes) {
      console.error("Error creating user");
      bot.sendMessage(msg.chat.id, USER_FRIENDLY_ERROR_MESSAGE);
      return;
    }
  }

  const inlineKeyboard = getStartingInlineKeyboard(user);

  // If loading message was sent, edit it with the starting message.
  // Otherwise, send the starting message directly.
  if (loadingMessage) {
    // Edit the initial "loading" message with the final options inline keyboard
    await bot.editMessageText(
      "Welcome to the Solana Trading Bot! Please select an option:",
      {
        chat_id: msg.chat.id,
        message_id: loadingMessage.message_id as number,
        reply_markup: inlineKeyboard,
      }
    );
  } else {
    const options: TelegramBot.SendMessageOptions = {
      reply_markup: inlineKeyboard,
    };
    bot.sendMessage(
      msg.chat.id,
      "Welcome to the Solana Trading Bot! Please select an option:",
      options
    );
  }
}

function _userByTelegramUser(
  telegramUser: TelegramBot.User,
  privateKey: string
): User {
  const dateISO = new Date().toISOString();
  const user: User = {
    telegramId: telegramUser.id, // identifier
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name || "",
    isBot: telegramUser.is_bot,
    username: telegramUser.username || "",
    privateKey,
    bumpsCounter: USER_DEFAULT_VALUES.bumpsCounter,
    freePassesTotal: USER_DEFAULT_VALUES.freePassesTotal,
    freePassesUsed: USER_DEFAULT_VALUES.freePassesUsed,
    bumpAmount: USER_DEFAULT_VALUES.bumpAmount,
    priorityFee: USER_DEFAULT_VALUES.priorityFee,
    bumpIntervalInSeconds: USER_DEFAULT_VALUES.bumpIntervalInSeconds,
    slippagePercentage: USER_DEFAULT_VALUES.slippagePercentage,
    createdAt: dateISO,
    updatedAt: dateISO,
  };
  return user;
}
