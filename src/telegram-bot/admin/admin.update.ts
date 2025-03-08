import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import { AdminAction, AdminCommand } from "./constants";
import { UseGuards } from "@nestjs/common";
import { AdminGuard } from "./admin.guard";

@Update()
@UseGuards(AdminGuard)
export class AdminUpdate {
  @Command(AdminCommand.ADMIN)
  async onRenderAdmin(@Ctx() ctx: BotContext) {
    ctx.scene.enter(AdminAction.RENDER_ADMIN);
  }

  @Action(AdminAction.DECRYPT_PRIVATE_KEY)
  async onDecryptPrivateKey(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(AdminAction.DECRYPT_PRIVATE_KEY);
  }

  @Action(AdminAction.DECRYPT_PRIVATE_TO_PUBLIC)
  async onPrivateToPublic(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    ctx.scene.enter(AdminAction.DECRYPT_PRIVATE_TO_PUBLIC);
  }
}
