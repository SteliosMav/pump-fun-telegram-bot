import { Global, Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { LoggerConfigService } from "./logger-config.service";
import { LoggerService } from "./logger.service";

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useClass: LoggerConfigService,
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
