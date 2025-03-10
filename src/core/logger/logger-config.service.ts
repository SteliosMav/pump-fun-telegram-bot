import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from "nest-winston";
import * as winston from "winston";
import { Configuration } from "../../shared/config";
import chalk from "chalk";

/**
 * @Improvements
 * 1): Error Categorization and Levels
 * Right now, every error is logged as level: error. However, some errors
 * (e.g., validation errors or user mistakes) might be more appropriate as warn
 * or info. Consider dynamically setting the log level based on the error type.
 * Use guards like instanceof Error or specific custom exceptions (e.g.,
 * ValidationError, HttpException)
 */

@Injectable()
export class LoggerConfigService implements WinstonModuleOptionsFactory {
  private env = this.configService.get<Configuration["NODE_ENV"]>("NODE_ENV");

  constructor(
    private readonly configService: ConfigService<Configuration, true>
  ) {}

  createWinstonModuleOptions(): WinstonModuleOptions {
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      this.env === "production"
        ? winston.format.json()
        : winston.format.printf(
            ({ timestamp, level, message, stack, error, ...meta }) => {
              const isErrorInstance =
                error instanceof Error || message instanceof Error;

              // Add coloring based on log level
              const levelColor =
                level === "error"
                  ? chalk.red(level.toUpperCase())
                  : level === "warn"
                  ? chalk.yellow(level.toUpperCase())
                  : chalk.green(level.toUpperCase());

              const log = `[${timestamp}] [${levelColor}]: ${
                isErrorInstance
                  ? (message &&
                      typeof message === "object" &&
                      "message" in message) ||
                    "Error occurred"
                  : message
              }`;

              const stackInfo =
                isErrorInstance &&
                error &&
                typeof error === "object" &&
                "stack" in error
                  ? `\n${error.stack}`
                  : stack
                  ? `\n${stack}`
                  : "";

              const metaInfo =
                Object.keys(meta).length > 0
                  ? `\nMeta: ${JSON.stringify(
                      { ...(isErrorInstance ? {} : { error }), ...meta },
                      null,
                      2
                    )}`
                  : "";

              return `${log}${stackInfo}${metaInfo}`;
            }
          )
    );

    return {
      format: customFormat,
      transports: [
        new winston.transports.Console({
          level: "info",
        }),
      ],
    };
  }
}
