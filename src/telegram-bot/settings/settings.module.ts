import { Module } from "@nestjs/common";
import { SlippageScene } from "./scenes/slippage.scene";
import { SettingsService } from "./settings.service";
import { SettingsUpdate } from "./settings.update";

@Module({
  providers: [SettingsUpdate, SlippageScene, SettingsService],
})
export class SettingsModule {}
