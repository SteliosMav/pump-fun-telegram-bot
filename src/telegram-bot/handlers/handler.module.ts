import { Module } from "@nestjs/common";
import { HandlerRegistry } from "../handler-system/handler-registry.service";
import { StartHandler } from "./start/start.handler";
import { DiscoveryModule } from "@nestjs/core";
import { HandlerLoaderService } from "../handler-system/handler-loader.service";

@Module({
  imports: [DiscoveryModule],
  providers: [HandlerRegistry, HandlerLoaderService, StartHandler],
  exports: [HandlerRegistry],
})
export class HandlerModule {}
