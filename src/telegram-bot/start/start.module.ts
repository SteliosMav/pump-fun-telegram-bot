import { Module } from "@nestjs/common";
import { StartUpdate } from "./start.update";
import { StartService } from "./start.service";

@Module({
  providers: [StartUpdate, StartService],
})
export class StartModule {}
