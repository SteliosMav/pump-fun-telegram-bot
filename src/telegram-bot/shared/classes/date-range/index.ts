import { DifFormat, RawDateRangeDif } from "./types";

export class DateRange {
  constructor(private readonly start: Date, private readonly end: Date) {}

  difference(format?: undefined): RawDateRangeDif;
  difference(format: DifFormat): string;
  difference(format?: DifFormat): RawDateRangeDif | string {
    const years = this.calculateYears();
    const months = this.calculateMonths();
    const days = this.calculateDays();
    const { hours, minutes, seconds } = this.calculateTime();

    const raw = { years, months, days, hours, minutes, seconds };

    if (format === "h? m? s?") {
      let durationText = "";

      if (raw.hours > 0) {
        durationText += `${raw.hours}h `;
      }
      if (raw.minutes > 0) {
        durationText += `${raw.minutes}m `;
      }
      if (raw.seconds > 0) {
        durationText += `${raw.seconds}s`;
      }

      return durationText;
    }

    return raw;
  }

  private calculateYears(): number {
    const years = this.end.getFullYear() - this.start.getFullYear();
    if (
      this.end.getMonth() < this.start.getMonth() ||
      (this.end.getMonth() === this.start.getMonth() &&
        this.end.getDate() < this.start.getDate())
    ) {
      return years - 1;
    }
    return years;
  }

  private calculateMonths(): number {
    let months = this.end.getMonth() - this.start.getMonth();
    if (months < 0) months += 12;
    if (this.end.getDate() < this.start.getDate()) {
      months -= 1;
    }
    return months;
  }

  private calculateDays(): number {
    const timeDifference = this.end.getTime() - this.start.getTime();
    return Math.floor(timeDifference / (1000 * 3600 * 24)) % 30;
  }

  private calculateTime(): { hours: number; minutes: number; seconds: number } {
    const timestamp = this.end.getTime() - this.start.getTime();
    const totalSeconds = Math.floor(timestamp / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  }
}
