import { Module } from "@nestjs/common";
import { PricingUpdate } from "./pricing.update";
import { PricingViewService } from "./pricing-view.service";
import { SolanaModule } from "../../core/solana";
import { GoToPricingScene } from "./go-to-pricing.scene";
import { RenderPricingScene } from "./render-pricing.scene";
import { PricingService } from "./pricing.service";
import { BuyServicePassScene } from "./scenes/buy-service-pass/buy-service-pass.scene";
import { BuyServicePassViewService } from "./scenes/buy-service-pass/buy-service-pass-view.service";
import { BuyTokenPassScene } from "./scenes/buy-token-pass/buy-token-pass.scene";
import { BuyTokenPassViewService } from "./scenes/buy-token-pass/buy-token-pass-view.service";
import { UserModule } from "../../core/user";

@Module({
  providers: [
    // Update
    PricingUpdate,

    // Services
    PricingService,
    PricingViewService,
    BuyServicePassViewService,
    BuyTokenPassViewService,
    RenderPricingScene,

    // Scenes
    GoToPricingScene,
    BuyServicePassScene,
    BuyTokenPassScene,
  ],
  imports: [SolanaModule, UserModule],
})
export class PricingModule {}
