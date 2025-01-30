import { Module } from "@nestjs/common";
import { PricingUpdate } from "./pricing.update";
import { PricingViewService } from "./pricing-view.service";
import { SolanaModule } from "../../core/solana";
import { GoToPricingScene } from "./pricing.scene";
import { PricingService } from "./pricing.service";
import { BuyServicePassScene } from "./scenes/buy-service-pass/buy-service-pass.scene";
import { BuyServicePassViewService } from "./scenes/buy-service-pass/buy-service-pass-view.service";

@Module({
  providers: [
    // Update
    PricingUpdate,

    // Services
    PricingService,
    PricingViewService,
    BuyServicePassViewService,

    // Scenes
    GoToPricingScene,
    BuyServicePassScene,
  ],
  imports: [SolanaModule],
})
export class PricingModule {}
