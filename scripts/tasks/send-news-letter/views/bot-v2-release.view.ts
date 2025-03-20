import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { SharedAction } from "../../../../src/telegram-bot/shared/constants";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BotV2ReleaseViewService {
  getMessage() {
    return `*📢  Ez Pump's Big Update - 1 WEEK of FREE BUMPS!  🎁*

Hey Pumpers! 👋

We're rolling out a massive update packed with *faster performance, a slicker UI, and major system improvements! 🎉

🔹 Smoother, faster, and more reliable than ever
🔹 Upgraded UI for a better user experience
🔹 Bug fixes & performance boosts

💥 To celebrate, EVERYONE gets a FREE service pass for a FULL WEEK—no strings attached! 💥

🚨 Spotted a bug? Let us know!* Your feedback is super valuable, and we'll reward those who report any issues or glitches.

Enjoy the update & happy pumping! 🚀`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: "START",
          callback_data: SharedAction.RENDER_HOME,
        },
      ],
    ];
  }
}
