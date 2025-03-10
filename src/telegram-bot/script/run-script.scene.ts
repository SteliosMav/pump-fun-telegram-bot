import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import _ from "lodash";
import { ScriptAction } from "./constants";
import { DEFAULT_REPLY_OPTIONS } from "../shared/constants";
import { SolanaService } from "../../core/solana/solana.service";
import { UserService } from "../../core/user/user.service";
import { PumpFunService } from "../../core/pump-fun/pump-fun.service";
import { toKeypair } from "../../core/solana";
import { testPumpFunProfileUpdate } from "./scripts/test-pump-fun-profile-update";
import { exportToFormattedJson } from "./scripts/migrate-database/export-to-formatted-json";
import { insertToDb } from "./scripts/migrate-database/insert-to-db";

@Scene(ScriptAction.RUN_SCRIPT)
export class RunScriptScene {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly userService: UserService,
    private readonly pumpFunService: PumpFunService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    ctx.scene.leave();
    return;

    // Prompt user for script
    const promptMsg = await ctx.reply(`Running script...`);

    // Run script
    // const responseMsg = await exportToFormattedJson(this.userService);
    // const responseMsg = await insertToDb(this.userService);
    // const responseMsg = await testPumpFunProfileUpdate(
    //   this.solanaService,
    //   this.pumpFunService
    // );

    // Finish
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      promptMsg.message_id,
      undefined,
      "finished",
      {
        ...DEFAULT_REPLY_OPTIONS,
      }
    );
    ctx.scene.leave();
  }
}
