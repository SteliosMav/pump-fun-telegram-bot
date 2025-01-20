import { Module } from "@nestjs/common";
import { SlippageScene } from "./scenes/slippage.scene";
import { SettingsService } from "./settings.service";
import { SettingsUpdate } from "./settings.update";
import { SettingsScene } from "./scenes/settings.scene";

@Module({
  providers: [SettingsUpdate, SettingsService, SlippageScene, SettingsScene],
})
export class SettingsModule {}
