import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { backButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { BOT_WEBSITE_URL } from "../../shared/constants";

@Injectable()
export class InfoViewService {
  getMessage(): string {
    return `👋   Hello! Feel free to reach out to us!
    

🎁  Your feedback is much appreciated and we are more than happy to reward it with more gifts!


🛡 We encourage our users to validate every transaction from our bot. We have no secret fees applied like other bots do. We take pride in being reliable and transparent to the users who trust us!
    


🌐 [ezpump.fun](${BOT_WEBSITE_URL})        ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)       ❓@ezpumpsupport`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [[backButton(SharedAction.GO_TO_HOME)]];
  }
}
