import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { Injectable } from "@nestjs/common";
import { ImageUrls } from "../constants";

@Injectable()
export class MigrationViewService {
  getMessage() {
    return `*🚀   The Next Chapter for EzPump*

EzPump launched as a fast, lightweight pump companion and quickly built a strong, active community. Now, its journey continues as part of the MicroPump ecosystem, where the core vision and experience will live on and grow even stronger.


*💼   No action needed* — all connected wallets have been securely transferred to MicroPump. Everything you had with EzPump is already waiting for you there.


*🙏   Thank you* to everyone who supported, used, and believed in EzPump. This evolution is part of the bigger picture and we're excited for what's next.`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: "🔗  Continue to MicroPump Bot",
          url: "https://t.me/micropump_bot",
        },
      ],
    ];
  }

  getImageUrl(): string {
    return ImageUrls.EZPUMP_MERGE_WITH_MICROPUMP;
  }
}
