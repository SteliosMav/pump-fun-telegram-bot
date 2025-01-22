import { Module } from "@nestjs/common";
import { SessionService } from "./session.service";
import { UserModule } from "../../../../core/user";
import { SolanaModule } from "../../../../core/solana";

@Module({
  providers: [SessionService],
  imports: [UserModule, SolanaModule],
  exports: [SessionService],
})
export class SessionModule {}
