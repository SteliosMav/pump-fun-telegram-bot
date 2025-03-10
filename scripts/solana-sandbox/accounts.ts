import { Keypair } from "@solana/web3.js";
import { toKeypair } from "../../src/core/solana/solana-utils";

export const SANDBOX_ACCOUNTS: Array<Keypair> = [
  "5m3E42AeJic6GxVwtBBdMFZcEWLL5hpFLTsVKfJg2xgr47w7rzmQKsSbnpeGmaQoNg15gn2ccbhvpNCJFbn2HPZy",
  "4gvM27BfoEXBMok7UYXXw8FckQYZmt9ctZJKAmSQxNWDadfhJYYPWHws7jTKSk4YZwLtkbFGw8u7EARyrrki2vCW",
  "65dHprVG7XAhsrPDXWiYfyTti3FnKrgnwbiiZZNUZgLfxz5KKerta7K1DQhj1sai52ikJoRQzADd8m87gVSejH9N",
  "3FrwBXenmfyVEfvW2gpaudgLW7AkNbgNqXmnF98FhCmqUNjzDNBytxUdAQWCuhSgq2Qb6cuNzb7tbbur4TpgkRLc",
].map((privateKey) => toKeypair(privateKey));
