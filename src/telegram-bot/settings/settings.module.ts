import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SettingsUpdate } from "./settings.update";
import { SlippageScene } from "./scenes/slippage.scene";
import { SettingsScene } from "./settings.scene";

@Module({
  providers: [SettingsUpdate, SettingsService, SlippageScene, SettingsScene],
})
export class SettingsModule {}
