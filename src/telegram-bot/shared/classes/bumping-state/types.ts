export type BumpingStatusType = "BUMPING" | "NOT_BUMPING" | "SHOULD_CANCEL";

export interface BumpingStateJSON {
  bumpStatus: BumpingStatusType;
  startedAt?: string;
  endedAt?: string;
  duration: number;
  succeeded: number;
  failed: number;
  isMaxFailedBumpsReached: boolean;
}
