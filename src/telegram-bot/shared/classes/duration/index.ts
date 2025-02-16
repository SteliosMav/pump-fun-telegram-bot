import { Duration as DurationInAllUnits, intervalToDuration } from "date-fns";

export class Duration {
  constructor(private readonly start: Date, private readonly end: Date) {
    if (start.getTime() > end.getTime()) {
      throw new Error("End date cannot be before start date.");
    }
  }

  inMilliseconds(): number {
    return this.end.getTime() - this.start.getTime();
  }

  inHumanFriendly() {
    const duration = this.inAllUnits();

    let durationText = "";

    // Short version
    if (duration.years) {
      durationText += `${duration.years}y `;
    }
    if (duration.months) {
      durationText += `${duration.months}mon `;
    }
    if (duration.days) {
      durationText += `${duration.days}d `;
    }
    if (duration.hours) {
      durationText += `${duration.hours}h `;
    }
    if (duration.minutes) {
      durationText += `${duration.minutes}m `;
    }
    if (duration.seconds) {
      durationText += `${duration.seconds}s`;
    }

    return durationText || "0s";
  }

  inAllUnits(): DurationInAllUnits {
    return intervalToDuration({
      start: this.start,
      end: this.end,
    });
  }
}
