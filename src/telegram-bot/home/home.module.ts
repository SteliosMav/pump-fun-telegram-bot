import { Module } from "@nestjs/common";
import { HomeUpdate } from "./home.update";
import { HomeService } from "./home.service";
import { RenderHomeScene } from "./render-home.scene";
import { SetTokenToBumpScene } from "./scenes/set-token-to-bump/set-token-to-bump.scene";
import { HomeViewService } from "./home-view.service";
import { SolanaModule } from "../../core/solana";
import { GoToHomeScene } from "./go-to-home.scene";
import { StartBumpingScene } from "./scenes/start-bumping/start-bumping.scene";
import { SetTokenToBumpViewService } from "./scenes/set-token-to-bump/set-token-to-bump-view.service";
import { PricingModule } from "../pricing/pricing.module";
import { StartBumpingViewService } from "./scenes/start-bumping/start-bumping-view.service";
import { UserModule } from "../../core/user";

@Module({
  providers: [
    // Update
    HomeUpdate,

    // Services
    HomeService,
    HomeViewService,
    SetTokenToBumpViewService,
    StartBumpingViewService,

    // Scenes
    RenderHomeScene,
    GoToHomeScene,
    SetTokenToBumpScene,
    StartBumpingScene,
  ],
  imports: [SolanaModule, PricingModule, UserModule],
})
export class HomeModule {}
