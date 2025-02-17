import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { Injectable } from "@nestjs/common";
import { AdminAction } from "./constants";

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
          text: `Private To Public`,
          callback_data: AdminAction.PRIVATE_TO_PUBLIC,
        },
      ],
    ];
  }

  getPrivateKeyMsg(privateKey: string) {
    return `_This message will be deleted automatically in 1 min:_
    
\`${privateKey}\``;
  }
}
