import { clusterApiUrl, Connection } from "@solana/web3.js";

export const CONNECTION = new Connection(clusterApiUrl("devnet"), "confirmed");
