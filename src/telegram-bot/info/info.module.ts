import { Module } from "@nestjs/common";
import { GoToInfoScene } from "./go-to-info.scene";
import { InfoViewService } from "./info-view.service";
import { InfoUpdate } from "./info.update";
import { RenderInfoScene } from "./render-info.scene";

@Module({
  providers: [InfoUpdate, InfoViewService, RenderInfoScene, GoToInfoScene],
})
export class InfoModule {}
