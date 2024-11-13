import { Connection, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import { Database } from "sqlite3";
import { User } from "src/users/types";
dotenv.config();
import { UserService } from "src/users/user.service";
import bs58 from "bs58";
import { CustomResponse } from "src/shared/types";
import { RPC_API, SOLANA_BOT_PRIVATE_KEY } from "src/constants";
import { PumpFunService } from "src/pump-fun/pump-fun.service";

console.log("Running draft file...");

const signature =
  // "2YnnZP6UqBGnEowCzFpErfPdegiV8tTAYcoajRvjuKdzsKJnKTYwgDRquSb5uTGweQavYG1xzNCoh7yZXKFSpDrW";
  "2Ny9Fj2AmWcjZjqET7REAVEqwnuhEo8aqQgYScFLuRcUGE15e5ScVRHsczk3JJ4SbJNgN7Pg2ERafWLKDTHfksnz";

(async () => {
  // const connection = new Connection(RPC_API, "confirmed");
  // const transactionDetails = await connection.getTransaction(signature, {
  //   commitment: "confirmed",
  // });
  // if (transactionDetails) {
  //   const logs = transactionDetails.meta?.logMessages;
  //   const insufficientSol = logs?.some((log) =>
  //     log.toLowerCase().includes("insufficient lamports")
  //   );
  //   console.log("Transaction logs:", logs);
  //   console.log("Insufficient SOL:", insufficientSol);
  //   // You can process the logs here to analyze specific errors
  // } else {
  //   console.log(
  //     "No transaction details found, or transaction was not confirmed."
  //   );
  // }
  // const payerPrivateKey = SOLANA_BOT_PRIVATE_KEY;
  // const priorityFeeInSol = 0.01;
  // const slippage = 0.25;
  // const solAmount = 0.0522;
  // const pumpFunService = new PumpFunService(
  //   payerPrivateKey,
  //   priorityFeeInSol,
  //   slippage,
  //   solAmount
  // );
  // const CA = "BY1SwWm5bfiTruq5gPjELbAQobRc26UzZFHXuMt2pump";
  // const res = await pumpFunService.bump(CA);
  // console.log("Bump response:", res);
})();
