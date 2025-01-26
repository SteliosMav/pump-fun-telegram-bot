import { Catch, ExceptionFilter } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { TelegrafExecutionContext } from "nestjs-telegraf";
import { LoggerService } from "../core/logger/logger.service";
import _ from "lodash";
import { Scenes } from "telegraf";
import { v4 as uuid } from "uuid";

@Catch()
export class BotExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  async catch(exception: unknown, host: ExecutionContextHost) {
    const telegrafCtx = TelegrafExecutionContext.create(host);
    const ctx: Scenes.SceneContext = telegrafCtx.getContext();

    // Log error details
    const logData: Record<string, any> = {
      traceId: uuid(),
    };
    if (_.isObject(exception) && "stack" in exception)
      logData.stack = exception.stack;
    if (ctx?.from?.id) logData.user = ctx.from.id;
    if (ctx?.chat?.id) logData.chat = ctx.chat.id;
    if (!_.isEmpty(exception)) logData.error = exception;
    this.logger.error("Uncaught error from the bot:", logData);

    // Send a response to the user
    await ctx.reply(
      `An error occurred due to high demand. Please try again in a moment.
      
We appreciate your patience!  🙏`
    );
    ctx.scene.leave();
  }
}
