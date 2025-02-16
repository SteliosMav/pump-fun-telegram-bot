import { Injectable } from "@nestjs/common";
import { BumpingState } from "../../../shared/classes/bumping-state";

@Injectable()
export class StartBumpingViewService {
  getBumpingStartedMsg(): string {
    return `The bumping started!`;
  }

  getCancelingBumpingMsg(bumpingState: BumpingState): string {
    return `Canceling bumping...`;
  }

  getBumpDataMsg(state: BumpingState): string {
    const durationText = state.duration.difference("h? m? s?");

    let statusText = "";
    let reasonText = "";

    if (state.isFinished) {
      statusText = "✅ Completed";
    } else {
      statusText = "Canceled ❌";
      if (state.isCanceledByUserRequest) {
        reasonText = "User request";
      } else if (state.isCanceledByUserActivity) {
        reasonText = "User activity";
      } else if (state.isCanceledByFailedAttempts) {
        reasonText = `${state.maxFailedBumps} failed bump attempts`;
      }
    }

    return `\`Status:      ${statusText}${
      reasonText ? `\nReason:      ${reasonText}` : ``
    }
Duration:    ${durationText}
Succeeded:   ${state.successCount}
Failed:      ${state.failureCount}\``;
  }
}
