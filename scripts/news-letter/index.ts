import TelegramBot from "node-telegram-bot-api";
import connectDB from "../../src/lib/mongo";
import { TELEGRAM_BOT_TOKEN } from "../../src/constants";
import { UserService } from "../../src/users/user.service";
import { ISSUES_APOLOGY } from "./views.ts/issues-apology";
import { THANK_FOR_TOKEN_PASS_AND_GIFT } from "./views.ts/thank-for-token-pass-and-gift";
import { USER_INCREASE_CELEBRATION_GIFT } from "./views.ts/user-increase-celebration-gift";
import { USER_BOT_TOKEN_PASS } from "./views.ts/user-bought-token-pass";
import { USER_MILISTONE } from "./views.ts/user-milestone";

// MongoDB connection
connectDB();

(async () => {
  // Initialize the bot
  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

  // List of user IDs (replace this with your database retrieval logic)
  const userService = new UserService();
  const allUserIds: number[] = await userService.getAllUserIds();
  const EXCLUDED_USER_IDS = [2128860501, 6416185160];
  // const userIds = allUserIds.filter((id) => !EXCLUDED_USER_IDS.includes(id));
  const userIds: number[] = [7256064596].filter(
    (id) => !EXCLUDED_USER_IDS.includes(id)
  );

  /**
   * Function to send a message to all users
   */

  const broadcastToUsers = async (userIds: number[]): Promise<void> => {
    let idx = 0;
    for (const userId of userIds) {
      try {
        // Message to broadcast
        const broadcastMessage = THANK_FOR_TOKEN_PASS_AND_GIFT(userId);

        // Send message
        // await bot.sendMessage(userId, message, {
        //   reply_markup: {
        //     inline_keyboard: [
        //       [
        //         {
        //           text: "OK ✔️",
        //           callback_data: "dismiss_error", // Identifier for callback
        //         },
        //       ],
        //     ],
        //   },
        //   parse_mode: "Markdown",
        // });
        // Send photo
        await bot.sendPhoto(
          userId,
          "https://plum-near-goat-819.mypinata.cloud/ipfs/bafkreifbp7x3hcumanzib3s7vnsdmgk4iscey7pm4qjjj4kkzxisltvvta",
          {
            caption: broadcastMessage,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "OK ✔️",
                    callback_data: "dismiss_error", // Identifier for callback
                  },
                ],
              ],
            },
          }
        );
        console.log(`Message sent to user ID: ${userId}`);
        idx++;
      } catch (error) {
        console.error(
          `Failed to send message to user ID ${userId}:`,
          (error as any).message
        );
        console.error(idx);
      }
    }
    process.exit();
  };

  // Call the broadcast function
  broadcastToUsers(userIds)
    .then(() => console.log("Broadcast completed."))
    .catch((err) => console.error("Error during broadcast:", err));
})();

/* Users who block our bot:
[
    6312255824, 565580102, 1062123105, 963808966, 6134749041, 6319401629,
    7856117822, 1894696051, 5791355521, 7727394043, 5509774801, 1063567820,
    1733263922, 1905572302, 5814055807, 5291246022, 508835316, 485202029,
    1527588273, 6101782915, 7607729063,
  ]
*/
