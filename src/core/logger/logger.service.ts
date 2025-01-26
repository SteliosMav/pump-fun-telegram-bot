import { Injectable, Scope } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

/**
 * @note See logger.debug and logger.verbose for future usage
 */

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  log(message: string, ...meta: any[]) {
    this.logger.info(message, ...meta);
  }

  error(message: string, ...meta: any[]) {
    this.logger.error(message, ...meta);
  }

  warn(message: string, ...meta: any[]) {
    this.logger.warn(message, ...meta);
  }
}
