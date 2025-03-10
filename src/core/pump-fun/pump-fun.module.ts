import { Module } from "@nestjs/common";
import { PumpFunService } from "./pump-fun.service";

@Module({
  providers: [PumpFunService],
  exports: [PumpFunService],
})
export class PumpFunModule {}
