import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SettingsUpdate } from "./settings.update";
import { SlippageScene } from "./scenes/slippage.scene";
import { SettingsScene } from "./settings.scene";
import { SettingsViewService } from "./settings-view.service";

@Module({
  providers: [
    SettingsUpdate,
    SettingsService,
    SlippageScene,
    SettingsScene,
    SettingsViewService,
  ],
})
export class SettingsModule {}
