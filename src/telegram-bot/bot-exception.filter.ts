import { Catch, ExceptionFilter } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { TelegrafExecutionContext } from "nestjs-telegraf";

@Catch()
export class BotExceptionFilter implements ExceptionFilter {
  async catch(exception: any, host: ExecutionContextHost) {
    const telegrafCtx = TelegrafExecutionContext.create(host);
    const ctx = telegrafCtx.getContext();

    console.error("Custom BotExceptionFilter caught an error:", exception);

    // Send a response to the user
    await ctx.reply(
      "An error occurred due to high demand. Please try again in a moment. We appreciate your patience!"
    );
    ctx.scene.leave();
  }
}
