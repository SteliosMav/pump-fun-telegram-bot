import { clusterApiUrl, Connection } from "@solana/web3.js";
import { HELIUS_API_STANDARD, QUICKNODE_API } from "./config";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class SolanaRpcService {
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
    @Inject("RPC_PROVIDER")
    private readonly provider: "quicknode" | "helius" | "devnet" | "rotate",
    @Inject("RPC_PROVIDERS") private readonly rpcProviders: string[]
  ) {
    let api = clusterApiUrl("devnet");
    switch (this.provider) {
      case "helius":
        api = HELIUS_API_STANDARD;
        break;
      case "quicknode":
        api = QUICKNODE_API;
    }
    this.staticConnection = new Connection(api, "confirmed");
  }

  private index: number = 0;

  private staticConnection: Connection = new Connection(
    clusterApiUrl("devnet")
  );
}
