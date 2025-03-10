import { Command, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { UseGuards } from "@nestjs/common";
import { ScriptAction, ScriptCommand } from "./constants";
import { AdminGuard } from "../admin/admin.guard";

@Update()
@UseGuards(AdminGuard)
export class ScriptUpdate {
  @Command(ScriptCommand.RUN)
  async onRunScript(@Ctx() ctx: BotContext) {
    ctx.scene.enter(ScriptAction.RUN_SCRIPT);
  }
}
