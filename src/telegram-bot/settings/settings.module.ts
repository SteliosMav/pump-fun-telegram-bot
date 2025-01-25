import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SettingsUpdate } from "./settings.update";
import { SlippageScene } from "./scenes/slippage.scene";
import { GoToSettingsScene } from "./go-to-settings.scene";
import { SettingsViewService } from "./settings-view.service";
import { UserModule } from "../../core/user";
import { RenderSettingsScene } from "./render-settings.scene";

@Module({
  providers: [
    SettingsUpdate,
    SettingsService,
    SlippageScene,
    GoToSettingsScene,
    RenderSettingsScene,
    SettingsViewService,
  ],
  imports: [UserModule],
})
export class SettingsModule {}
