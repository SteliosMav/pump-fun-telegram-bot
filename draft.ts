import dotenv from "dotenv";
import { Database } from "sqlite3";
import { User } from "src/users/types";
dotenv.config();
import { UserService } from "src/users/user.service";

console.log("Running draft file...");

const db = new Database("telegram_bot.db");
const userService = new UserService(db);

// const dateISO = new Date().toISOString();
// const user: User = {
//   telegramId: 123456787, // identifier
//   privateKey: "my-private",
//   firstName: "John",
//   lastName: "Doe",
//   isBot: false,
//   pumpsCounter: 0,
//   username: "johndoe",
//   createdAt: dateISO,
//   updatedAt: dateISO,
// };
// const newUser = userService.create(user);
// console.log("New user: ", newUser);
