export interface DateRangeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export type DateDifferenceFormat = "h? m? s?" | "in-milliseconds";
