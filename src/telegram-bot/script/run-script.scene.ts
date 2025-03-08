import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";
import _ from "lodash";
import { ScriptAction } from "./constants";
import { DEFAULT_REPLY_OPTIONS } from "../shared/constants";
import { SolanaService } from "../../core/solana/solana.service";
import { UserService } from "../../core/user/user.service";
import { PumpFunService } from "../../core/pump-fun/pump-fun.service";
import { toKeypair } from "../../core/solana";

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
    const privateKey = this.solanaService.createPrivateKey();
    const keypair = toKeypair(privateKey);
    const response = await this.pumpFunService.createProfile(keypair);
    console.log(response);
    const responseMsg = `
*Public Key:*  \`${keypair.publicKey.toString()}\`
*Private Key:*  \`${privateKey}\`
`;

    // Finish
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      promptMsg.message_id,
      undefined,
      responseMsg,
      {
        ...DEFAULT_REPLY_OPTIONS,
      }
    );
    ctx.scene.leave();
  }
}
