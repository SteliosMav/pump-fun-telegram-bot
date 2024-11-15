import { Connection, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import { Database } from "sqlite3";
import { User } from "src/users/types";
dotenv.config();
import { UserService } from "src/users/user.service";
import bs58 from "bs58";
import { CustomResponse } from "src/shared/types";
import {
  BOT_USERNAME_BASE,
  RPC_API,
  SOLANA_BOT_PRIVATE_KEY,
} from "src/constants";
import { PumpFunService } from "src/pump-fun/pump-fun.service";

console.log("Running draft file...");

(async () => {
  const db = new Database("telegram_bot.db");
  const userService = new UserService(db);

  const users = await userService.getUsers();

  users.forEach(async (user: User) => {
    const res = await userService.setUpUsersPumpFunAcc(
      user.telegramId,
      user.privateKey
    );
    console.log("res:", res);
  });

  // console.log("Users:", users);
})();
