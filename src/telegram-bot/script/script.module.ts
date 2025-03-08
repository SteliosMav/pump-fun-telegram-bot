import { Module } from "@nestjs/common";
import { UserModule } from "../../core/user";
import { CryptoModule } from "../../core/crypto";
import { ScriptUpdate } from "./script.update";
import { PumpFunModule } from "../../core/pump-fun";
import { RunScriptScene } from "./run-script.scene";
import { SolanaModule } from "../../core/solana";

@Module({
  providers: [
    // Update
    ScriptUpdate,

    // Scenes
    RunScriptScene,
  ],
  imports: [CryptoModule, UserModule, PumpFunModule, SolanaModule],
})
export class ScriptModule {}
