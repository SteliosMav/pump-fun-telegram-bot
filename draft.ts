import { Connection, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import { User } from "src/users/types";
dotenv.config();
import { UserService } from "src/users/user.service";
import bs58 from "bs58";
import { CustomResponse } from "src/shared/types";
import {
  BOT_USERNAME_BASE,
  ENCRYPTION_KEY,
  RPC_API,
  SOLANA_BOT_PRIVATE_KEY,
} from "src/constants";
import { PumpFunService } from "src/pump-fun/pump-fun.service";
import connectDB from "src/lib/mongo";
import CryptoJS from "crypto-js";

import mongoose, { Schema, Document } from "mongoose";
import { UserModel } from "src/users/user-model";

// MongoDB connection
connectDB();

(async () => {
  // updateUserPumpFunProfiles();
  // const userService = new UserService();
  // const currentDate = new Date(); // Get the current date
  // currentDate.setDate(currentDate.getDate() + 3); // Add 3 days to the current date
  // const expirationDate = currentDate.toISOString(); // Convert the date to ISO string format
  // const res = await userService.assignServiceFeePass(
  //   7637618506
  //   // expirationDate
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
