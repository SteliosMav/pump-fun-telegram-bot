import dotenv from "dotenv";
import { Database } from "sqlite3";
import { User } from "src/users/types";
dotenv.config();
import { UserService } from "src/users/user.service";

console.log("Running draft file...");

(async () => {
  const db = new Database("telegram_bot.db");
  const userService = new UserService(db);

  //   const freePasses = await userService.getFreePasses(123456787);
  //   console.log("Free passes: ", freePasses);

  //   const freePasses = await userService.giveFreePass(123456789);
  //   console.log("Free passes: ", freePasses);

  //   const privateKey = await userService.getPrivateKey(123456787);
  //   console.log("Private key: ", privateKey);

  const dateISO = new Date().toISOString();
  const user: User = {
    telegramId: 123456789, // identifier
    privateKey: "my-private",
    firstName: "John",
    lastName: "Doe",
    isBot: false,
    pumpsCounter: 0,
    username: "johndoe",
    freePassesTotal: 0,
    freePassesUsed: 0,
    pumpAmount: 0.0103,
    priorityFee: 0.02,
    pumpIntervalInSeconds: 1,
    slippagePercentage: 0.3,
    createdAt: dateISO,
    updatedAt: dateISO,
  };
  const newUser = await userService.create(user);
  console.log("New user: ", newUser);
})();
