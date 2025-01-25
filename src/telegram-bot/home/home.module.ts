import { Module } from "@nestjs/common";
import { HomeUpdate } from "./home.update";
import { HomeService } from "./home.service";
import { RenderHomeScene } from "./render-home.scene";
import { BumpScene } from "./scenes/bump.scene";
import { HomeViewService } from "./home-view.service";
import { SolanaModule } from "../../core/solana";
import { GoToHomeScene } from "./go-to-home.scene";

@Module({
  providers: [
    HomeUpdate,
    HomeService,
    RenderHomeScene,
    GoToHomeScene,
    HomeViewService,
    BumpScene,
  ],
  imports: [SolanaModule],
})
export class HomeModule {}
