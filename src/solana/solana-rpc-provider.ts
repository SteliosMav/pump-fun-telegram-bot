import { clusterApiUrl, Connection } from "@solana/web3.js";
import { HELIUS_API_STANDARD, QUICKNODE_API } from "./config";

export class SolanaRPCProvider {
  get connection(): Connection {
    if (this.provider === "rotate") {
      const currentConnection = this.rpcProviders[this.index];

      const rotationIsOver = this.index + 1 === this.rpcProviders.length;
      if (rotationIsOver) {
        this.index = 0;
      } else {
        this.index++;
      }

      return new Connection(currentConnection, "confirmed");
    } else {
      return this.staticConnection;
    }
  }

  constructor(
    private provider: "quicknode" | "helius" | "devnet" | "rotate" = "rotate"
  ) {
    let api = clusterApiUrl("devnet");
    switch (provider) {
      case "helius":
        api = HELIUS_API_STANDARD;
        break;
      case "quicknode":
        api = QUICKNODE_API;
    }
    this.staticConnection = new Connection(api, "confirmed");
  }

  private rpcProviders: string[] = [QUICKNODE_API, HELIUS_API_STANDARD];
  private index: number = 0;

  private staticConnection: Connection = new Connection(
    clusterApiUrl("devnet")
  );
}
