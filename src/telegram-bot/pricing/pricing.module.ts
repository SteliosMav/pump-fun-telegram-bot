import { Module } from "@nestjs/common";
import { PricingUpdate } from "./pricing.update";
import { PricingViewService } from "./pricing-view.service";
import { SolanaModule } from "../../core/solana";
import { GoToPricingScene } from "./pricing.scene";
import { PricingService } from "./pricing.service";
import { BuyServicePassScene } from "./scenes/buy-service-pass.scene";

@Module({
  providers: [
    // Update
    PricingUpdate,

    // Services
    PricingService,
    PricingViewService,

    // Scenes
    GoToPricingScene,
    BuyServicePassScene,
  ],
  imports: [SolanaModule],
})
export class PricingModule {}
