import { Module } from "@nestjs/common";
import { SlippageScene } from "./slippage.scene";
import { SlippageHandler } from "./slippage.handler";
import { SlippageService } from "./slippage.service";

@Module({
  providers: [SlippageScene, SlippageHandler, SlippageService],
  exports: [SlippageService],
})
export class SlippageModule {}
