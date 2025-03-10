export function toYYYYMMDD(date: Date) {
  return date.toISOString().split("T")[0];
}
