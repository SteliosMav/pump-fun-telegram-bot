import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { AdminAction } from "../../constants";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import _ from "lodash";
import { AdminService } from "../../admin.service";
import { EncryptedPrivateKeyDto } from "./encrypted-private-key.dto";
import { AdminViewService } from "../../admin-view.service";
import { DEFAULT_REPLY_OPTIONS } from "../../../shared/constants";

@Scene(AdminAction.DECRYPT_PRIVATE_KEY)
export class DecryptPrivateKeyScene {
  constructor(
    private readonly adminService: AdminService,
    private readonly viewService: AdminViewService
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: BotContext) {
    await ctx.reply(`Enter an encrypted private key:`);
  }

  @On("text")
  async onEncryptedPrivateKeyInput(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>
  ) {
    // Allow commands to propagate
    if (ctx.message.text.startsWith("/")) {
      return next();
    }

    const input: EncryptedPrivateKeyDto = {
      encryptedPrivateKey: ctx.message.text,
    };
    const { encryptedPrivateKey }: EncryptedPrivateKeyDto = plainToInstance(
      EncryptedPrivateKeyDto,
      input
    );
    const errors = await validate(input);

    /**
     * @WARNING THE DECRYPTION SHOULD BE DONE INSIDE THE VALIDATOR DTO CLASS
     */

    if (errors.length) {
      // Invalid input
      await ctx.reply(`Invalid input. Please try again:`);
    } else {
      // Decrypt and send private key
      const privateKey =
        this.adminService.decryptPrivateKey(encryptedPrivateKey);
      const message = await ctx.reply(
        this.viewService.getPrivateKeyMsg(privateKey),
        {
          ...DEFAULT_REPLY_OPTIONS,
        }
      );
      this.adminService.deleteMessageAfterDelay(ctx, message);
      ctx.scene.leave();
    }
  }
}
