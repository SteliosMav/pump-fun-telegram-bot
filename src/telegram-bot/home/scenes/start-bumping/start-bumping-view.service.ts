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
    const lastedLessThanMinute = state.duration < 1000 * 60;

    let durationText = "";
    let statusText = "";
    let reasonText = "";

    const addPlural = (amount: number): string => (amount > 1 ? "s" : "");

    if (lastedLessThanMinute) {
      const durationInSeconds = Math.round(state.duration / 1000);
      durationText = `${durationInSeconds} second${addPlural(
        durationInSeconds
      )}`;
    } else {
      const durationInMinutes = Math.round(state.duration / 1000 / 60);
      durationText = `${durationInMinutes} minute${addPlural(
        durationInMinutes
      )}`;
    }

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
