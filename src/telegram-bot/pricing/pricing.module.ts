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
import { UseTokenPassScene } from "./scenes/use-token-pass/use-token-pass.scene";
import { UseTokenPassViewService } from "./scenes/use-token-pass/use-token-pass-view.service";

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
    UseTokenPassViewService,

    // Scenes
    GoToPricingScene,
    BuyServicePassScene,
    BuyTokenPassScene,
    UseTokenPassScene,
  ],
  imports: [SolanaModule, UserModule],
  exports: [PricingService],
})
export class PricingModule {}
