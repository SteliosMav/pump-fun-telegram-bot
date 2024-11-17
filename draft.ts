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
  const db = new Database("telegram_bot.db");
  const userService = new UserService(db);
  // const users = await userService.getUsers();

  // const userDoc = await userService.getUser(7607729063);

  const res = await userService.updateBumpAmount(7607729063, "0.0124" as any);

  console.log(res);

  // console.log(new Date().toISOString());

  return;
  // users.forEach(async (user: User) => {
  //   try {
  //     // Create a user in the MongoDB database
  //     const res = await userService.create({ use: 2 } as any);
  //     console.log("User created:", res);
  //   } catch (error) {
  //     console.error("Error creating user:", error);
  //   }
  // });
})();
