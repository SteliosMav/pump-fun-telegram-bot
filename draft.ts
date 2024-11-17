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
  // const userService = new UserService();
  // const users = await userService.getUsers();
  // console.log(users);
  // const res = await userService.getUser(7607729063);
  // const res = await userService.updateBumpAmount(7607729063, 5);
  // const res = await userService.incrementBumpsCounter(7607729063, 2);
  // console.log(res);
  // console.log(new Date().toISOString());
  // users.forEach(async (user: User) => {
  //   try {
  //     // Create a user in the MongoDB database
  //     const res = await userService.create(user);
  //     console.log("User created:", res);
  //   } catch (error) {
  //     console.error("Error creating user:", error);
  //   }
  // });
})();
