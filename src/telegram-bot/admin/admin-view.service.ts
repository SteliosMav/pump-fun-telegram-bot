import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { Injectable } from "@nestjs/common";
import { AdminAction } from "./constants";
import { PublicKey } from "@solana/web3.js";

@Injectable()
export class AdminViewService {
  constructor() {}

  getMessage(): string {
    return `*📌  ADMIN*
━━━━━━

👋  *Hello judge!*

_- What can I do for you?_`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: `Decrypt Private Key`,
          callback_data: AdminAction.DECRYPT_PRIVATE_KEY,
        },
        {
          text: `Decrypt to Public Key`,
          callback_data: AdminAction.DECRYPT_PRIVATE_TO_PUBLIC,
        },
      ],
    ];
  }

  getPrivateKeyMsg(privateKey: string) {
    return `_This message will be deleted automatically in 1 min:_
    
\`${privateKey}\``;
  }

  getPublicKeyMsg(publicKey: PublicKey) {
    return `_Public key extracted:_
    
\`${publicKey.toString()}\``;
  }
}
