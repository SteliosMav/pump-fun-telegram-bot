import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { SharedAction } from "../../../../src/telegram-bot/shared/constants";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BotV2ReleaseViewService {
  getMessage() {
    return `Test message`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: "➡️  GO TO HOME",
          callback_data: SharedAction.GO_TO_HOME,
        },
      ],
    ];
  }
}
