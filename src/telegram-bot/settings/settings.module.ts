import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SettingsUpdate } from "./settings.update";
import { SlippageScene } from "./scenes/slippage/slippage.scene";
import { GoToSettingsScene } from "./go-to-settings.scene";
import { SettingsViewService } from "./settings-view.service";
import { UserModule } from "../../core/user";
import { RenderSettingsScene } from "./render-settings.scene";
import { AmountScene } from "./scenes/amount/amount.scene";
import { IntervalScene } from "./scenes/interval/interval.scene";
import { PriorityFeeScene } from "./scenes/priority-fee/priority-fee.scene";
import { LimitScene } from "./scenes/limit/limit.scene";
import { PricingModule } from "../pricing/pricing.module";

@Module({
  providers: [
    SettingsUpdate,
    SettingsService,
    SlippageScene,
    GoToSettingsScene,
    RenderSettingsScene,
    SettingsViewService,
    AmountScene,
    IntervalScene,
    PriorityFeeScene,
    LimitScene,
  ],
  imports: [UserModule, PricingModule],
})
export class SettingsModule {}
