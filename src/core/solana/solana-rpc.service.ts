import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "../../shared/config";

@Injectable()
export class SolanaRpcService {
  private provider: "quicknode" | "helius" | "devnet" | "rotate" = "rotate";

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
    private readonly configService: ConfigService<Configuration, true>
  ) {
    let api = clusterApiUrl("devnet");
    switch (this.provider) {
      case "helius":
        api = this.configService.get("HELIUS_API_STANDARD");
        break;
      case "quicknode":
        api = this.configService.get("QUICKNODE_API");
    }
    this.staticConnection = new Connection(api, "confirmed");
  }

  private rpcProviders: string[] = [
    this.configService.get("HELIUS_API_STANDARD"),
    this.configService.get("QUICKNODE_API"),
  ];
  private index: number = 0;

  private staticConnection: Connection = new Connection(
    clusterApiUrl("devnet")
  );
}
