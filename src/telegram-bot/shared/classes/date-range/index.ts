import { DateDifferenceFormat, DateRangeBreakdown } from "./types";
import { DateTime } from "luxon";

export class DateRange {
  constructor(private readonly start: Date, private readonly end: Date) {
    if (start.getTime() > end.getTime()) {
      throw new Error("End date cannot be before start date.");
    }
  }

  difference(): DateRangeBreakdown;
  difference(format: "h? m? s?"): string;
  difference(format: "in-milliseconds"): number;
  difference(
    format?: DateDifferenceFormat
  ): DateRangeBreakdown | string | number {
    if (format === "in-milliseconds") {
      return this.end.getTime() - this.start.getTime();
    }

    const startDateTime = DateTime.fromJSDate(this.start);
    const endDateTime = DateTime.fromJSDate(this.end);

    if (format === "h? m? s?") {
      const diff = endDateTime.diff(startDateTime, [
        "hours",
        "minutes",
        "seconds",
      ]);
      let durationText = "";

      if (diff.hours > 0) {
        durationText += `${diff.hours}h `;
      }
      if (diff.minutes > 0) {
        durationText += `${diff.minutes}m `;
      }
      if (diff.seconds > 0) {
        durationText += `${diff.seconds}s`;
      }

      return durationText || "0s";
    }

    const durationObject = endDateTime
      .diff(startDateTime, [
        "years",
        "months",
        "days",
        "hours",
        "minutes",
        "seconds",
        "milliseconds",
      ])
      .toObject();

    return {
      years: durationObject.years ?? 0,
      months: durationObject.months ?? 0,
      days: durationObject.days ?? 0,
      hours: durationObject.hours ?? 0,
      minutes: durationObject.minutes ?? 0,
      seconds: durationObject.seconds ?? 0,
      milliseconds: durationObject.milliseconds ?? 0,
    };
  }
}
