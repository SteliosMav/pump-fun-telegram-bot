import { Module } from "@nestjs/common";
import { HomeUpdate } from "./home.update";
import { HomeService } from "./home.service";
import { HomeScene } from "./scenes/home.scene";
import { StartBumpingScene } from "./scenes/start-bumping.scene";

@Module({
  providers: [HomeUpdate, HomeService, HomeScene, StartBumpingScene],
})
export class HomeModule {}
