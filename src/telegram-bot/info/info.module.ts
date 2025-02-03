import { Module } from "@nestjs/common";
import { GoToInfoScene } from "./go-to-info.scene";
import { InfoViewService } from "./info-view.service";
import { InfoUpdate } from "./info.update";

@Module({
  providers: [InfoUpdate, InfoViewService, GoToInfoScene],
})
export class InfoModule {}
