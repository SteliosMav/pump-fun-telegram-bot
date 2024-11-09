import { SolanaService } from "../../solana/solana.service";
import { BasicHandlerArguments } from "../types";

export async function getBalanceHandler({ bot, msg }: BasicHandlerArguments) {
  const balance = "unknown";
  bot.sendMessage(msg.chat.id, `Your balance: ${balance} SOL`);
}
