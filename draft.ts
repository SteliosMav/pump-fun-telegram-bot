import dotenv from "dotenv";
dotenv.config();
import CryptoJS from "crypto-js";

import mongoose, { Schema, Document } from "mongoose";
import { UserService } from "./src/users/user.service";
import connectDB from "./src/lib/mongo";
import { User } from "./src/users/types";
import { userHasTokenPass } from "./src/users/util";

// MongoDB connection
connectDB();

(async () => {
  // updateUserPumpFunProfiles();
  //
  // const userService = new UserService();
  // const user = (await userService.getUser(7637618506)) as User;
  // console.log(user);
  // const res = userHasTokenPass(
  //   user,
  //   "BXPYaqQxbmcyMcNmmS63bjtdtxpQ7BFRgJznL4A9pump"
  // );
  // console.log(res);
  //
  // Give user service-pass
  // const userService = new UserService();
  // const currentDate = new Date(); // Get the current date
  // currentDate.setDate(currentDate.getDate() + 1); // Add 3 days to the current date
  // const expirationDate = currentDate.toISOString(); // Convert the date to ISO string format
  // const res = await userService.giveServiceFeePass(
  //   7637618506,
  //   expirationDate
  // );
  // console.log("User updated:", res);
})();

async function updateUserPumpFunProfiles() {
  const userService = new UserService();
  const users = await userService.getUsers();

  users.forEach(async (user: User) => {
    try {
      const res = await userService.setUpUsersPumpFunAcc(
        user.telegramId,
        user.privateKey
      );
      console.log("User updated:", res);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  });
}
