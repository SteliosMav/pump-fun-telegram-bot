import { Connection, SendOptions } from "@solana/web3.js";
import bs58 from "bs58";
import { JitoResponse } from "./type";

export type JitoRegion = "mainnet" | "amsterdam" | "frankfurt" | "ny" | "tokyo";
export const JitoEndpoints = {
  mainnet: "https://mainnet.block-engine.jito.wtf/api/v1/transactions",
  amsterdam:
    "https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions",
  frankfurt:
    "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions",
  ny: "https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions",
  tokyo: "https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions",
};
export function getJitoEndpoint(region: JitoRegion) {
  return JitoEndpoints[region];
}

/**
 * Send a transaction using Jito. This only supports sending a single transaction on mainnet only.
 * See https://jito-labs.gitbook.io/mev/searcher-resources/json-rpc-api-reference/transactions-endpoint/sendtransaction.
 * @param args.serialisedTx - A single transaction to be sent, in serialised form
 * @param args.region - The region of the Jito endpoint to use
 */
export async function sendTxUsingJito({
  serializedTx,
  region = "mainnet",
}: {
  serializedTx: Uint8Array | Buffer | number[];
  region: JitoRegion;
}): Promise<JitoResponse> {
  let rpcEndpoint = getJitoEndpoint(region);
  let encodedTx = bs58.encode(serializedTx);
  let payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendTransaction",
    params: [encodedTx],
  };
  let res = await fetch(`${rpcEndpoint}?bundleOnly=true`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  let json = await res.json();
  if (json.error) {
    throw new Error(json.error.message);
  }
  return json;
}
