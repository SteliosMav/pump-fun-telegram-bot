// import dotenv from "dotenv";
// dotenv.config();

// import connectDB from "../lib/mongo";
// import { cleanUserStateInterval } from "./util";
// import { Bot } from "./bot";
// import { Server } from "./server";
// import { UserStore } from "./user-store";
// import { DependencyContainer } from "../dependency-injection/dependency-container";

// (async () => {
//   // MongoDB connection
//   await connectDB();

//   // Inject bot with dependencies and initialize it
//   const container = new DependencyContainer();
//   const bot = container.inject(Bot);
//   bot.init();

//   // Init server for health-checks
//   const server = new Server();
//   await server.init();
// })();
