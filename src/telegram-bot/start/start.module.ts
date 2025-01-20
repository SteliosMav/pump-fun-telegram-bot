import { Module } from "@nestjs/common";
import { StartUpdate } from "./start.update";
import { StartService } from "./start.service";
import { StartScene } from "./scenes/start.scene";
import { StartBumpingScene } from "./scenes/start-bumping.scene";

@Module({
  providers: [StartUpdate, StartService, StartScene, StartBumpingScene],
})
export class StartModule {}
