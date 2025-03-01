import { Injectable } from "@nestjs/common";
import { BumpingState } from "../../../shared/classes/bumping-state";
import { InlineKeyboardButton } from "@telegraf/types";
import { HomeAction } from "../../constants";

@Injectable()
export class StartBumpingViewService {
  getBumpingStartedMsg(): string {
    return `🔥  *The bumping started!*

    
⚠️  _Any further interaction will cancel the process!_`;
  }

  getCancelingBumpingMsg(): string {
    return `_Canceling bumping..._`;
  }

  getBumpDataMsg(state: BumpingState): string {
    const durationText = state.duration.inHumanFriendly();

    let statusText = "";
    let reasonText = "";

    if (state.isFinished) {
      statusText = "✅ Completed";
    } else {
      statusText = "⚠️ Canceled";
      if (state.isCanceledByUserRequest) {
        reasonText = "User requested";
      } else if (state.isCanceledByUserActivity) {
        reasonText = "User activity";
      } else if (state.isCanceledByFailedAttempts) {
        reasonText = `${state.maxFailedBumps} failed bump attempts`;
      }
    }

    return `*Bumping Finished!*

\`Status:      ${statusText}${reasonText ? `\nReason:      ${reasonText}` : ``}
Duration:    ${durationText}
Succeeded:   ${state.successCount}
Failed:      ${state.failureCount}\``;
  }

  getCancelButton(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: `❌  Cancel`,
          callback_data: HomeAction.CANCEL_BUMPING,
        },
      ],
    ];
  }
}
