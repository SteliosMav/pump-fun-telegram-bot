import dotenv from "dotenv";
dotenv.config();

import { UserMap, UserState } from "./types";
import connectDB from "../lib/mongo";
import { cleanUserStateInterval } from "./util";
import { Bot } from "./bot";
import { Server } from "./server";

// MongoDB connection
connectDB();

// User state management
const userMap: UserMap = new Map<number, UserState>();
cleanUserStateInterval(userMap);

// Init bot
const bot = new Bot();
bot.init();

// Init server for health-checks
const server = new Server();
server.init();
