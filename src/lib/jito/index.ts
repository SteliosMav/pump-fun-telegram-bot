import bs58 from "bs58";
import { BundleStatus, JitoResponse } from "./type";

type JitoRegion = "mainnet" | "amsterdam" | "frankfurt" | "ny" | "tokyo";
const JitoEndpoints = {
  mainnet: "https://mainnet.block-engine.jito.wtf/api/v1/transactions",
  amsterdam:
    "https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions",
  frankfurt:
    "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions",
  ny: "https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions",
  tokyo: "https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions",
};
function getJitoEndpoint(region: JitoRegion) {
  return JitoEndpoints[region];
}

/**
 * Send a transaction using Jito. This only supports sending a single transaction on mainnet only.
 * See https://jito-labs.gitbook.io/mev/searcher-resources/json-rpc-api-reference/transactions-endpoint/sendtransaction.
 * @param args.serialisedTx - A single transaction to be sent, in serialised form
 * @param args.region - The region of the Jito endpoint to use
 */
export async function sendTxUsingJito(
  serializedTx: Uint8Array | Buffer | number[],
  region: JitoRegion = "frankfurt"
): Promise<JitoResponse> {
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

/**
 * The below code is just for future reference. No need to be used anywhere
 * in the app at this point - although it's tested and it works.
 */
async function sendTxUsingJitoBundles(
  serializedTxs: (Uint8Array | Buffer | number[])[]
): Promise<BundleStatus> {
  let endpoint = "https://mainnet.block-engine.jito.wtf/api/v1/bundles";
  let payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendBundle",
    params: [serializedTxs.map((t) => bs58.encode(t))],
  };

  let res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  let json = await res.json();
  if (json.error) {
    throw new Error(json.error.message);
  }

  const bundleId = json.result;

  console.log("Bundle res:", json);

  return getBundleStatus(bundleId);
}

async function getBundleStatus(id: string): Promise<BundleStatus> {
  let endpoint = "https://mainnet.block-engine.jito.wtf/api/v1/bundles";

  let payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "getBundleStatuses",
    params: [[id]],
  };

  let res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  let json = await res.json();
  if (json.error) {
    throw new Error(json.error.message);
  }

  console.log("Bundle status response:", json);

  return json;
}
