import { BasicHandlerArguments } from "../../types";

export async function bumpAmountController({
  bot,
  msg,
}: BasicHandlerArguments) {
  bot.sendMessage(msg.chat.id, "Enter the token CA:");
  bot.once("message", async (response) => {
    const mintStr = response.text as string;
    bot.sendMessage(msg.chat.id, `Should buy token for ${mintStr}`);
  });
}
