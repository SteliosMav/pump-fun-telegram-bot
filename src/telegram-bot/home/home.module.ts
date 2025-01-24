import { Module } from "@nestjs/common";
import { HomeUpdate } from "./home.update";
import { HomeService } from "./home.service";
import { HomeScene } from "./home.scene";
import { BumpScene } from "./scenes/bump.scene";
import { HomeViewService } from "./home-view.service";

@Module({
  providers: [HomeUpdate, HomeService, HomeScene, HomeViewService, BumpScene],
})
export class HomeModule {}
