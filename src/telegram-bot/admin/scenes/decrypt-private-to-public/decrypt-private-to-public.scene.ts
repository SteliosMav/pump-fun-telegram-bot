import { Scene, SceneEnter, On, Ctx, Next } from "nestjs-telegraf";
import { BotContext } from "../../../bot.context";
import { AdminAction } from "../../constants";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import _ from "lodash";
import { AdminService } from "../../admin.service";
import { AdminViewService } from "../../admin-view.service";
import { DEFAULT_REPLY_OPTIONS } from "../../../shared/constants";
import { PrivateKeyDto } from "../../dto/private-key.dto";
import { toKeypair } from "../../../../core/solana";
import { EncryptedPrivateKeyDto } from "../../dto/encrypted-private-key.dto";

@Scene(AdminAction.DECRYPT_PRIVATE_TO_PUBLIC)
export class DecryptPrivateToPublicScene {
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

    // Validate encrypted private key
    const encryptedPrivateKeyInput: EncryptedPrivateKeyDto = {
      encryptedPrivateKey: ctx.message.text,
    };
    const encryptedPrivateKeyDto: EncryptedPrivateKeyDto = plainToInstance(
      EncryptedPrivateKeyDto,
      encryptedPrivateKeyInput
    );
    const decryptionErrors = await validate(encryptedPrivateKeyDto);

    if (decryptionErrors.length) {
      await ctx.reply(`Invalid input: Encrypted key must be a string`);
      return;
    }

    // Decrypt private key
    let decryptedPrivateKey: string = "";
    try {
      decryptedPrivateKey = this.adminService.decryptPrivateKey(
        encryptedPrivateKeyDto.encryptedPrivateKey
      );
    } catch (e) {
      const errorMsg =
        e && typeof e === "object" && "message" in e ? e.message : "";
      await ctx.reply(
        `Invalid input: Decryption failed.${errorMsg ? ` ${errorMsg}` : ""}`
      );
      return;
    }

    // Validate decrypted private key
    const privateKeyInput: PrivateKeyDto = {
      privateKey: decryptedPrivateKey,
    };
    const privateKeyDto: PrivateKeyDto = plainToInstance(
      PrivateKeyDto,
      privateKeyInput
    );
    const privateKeyErrors = await validate(privateKeyDto);

    if (privateKeyErrors.length) {
      await ctx.reply(`Invalid input: Decrypted private key is not valid `);
      return;
    }

    // Success response
    const keypair = toKeypair(privateKeyDto.privateKey);
    await ctx.reply(this.viewService.getPublicKeyMsg(keypair.publicKey), {
      ...DEFAULT_REPLY_OPTIONS,
    });
    ctx.scene.leave();
  }
}
