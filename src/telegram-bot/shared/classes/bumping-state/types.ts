export type BumpingStatusType =
  | "NOT_BUMPING"
  | "BUMPING"
  | "FINISHED"
  | "SHOULD_CANCEL"
  | "CANCELED";

export interface BumpingStateJSON {
  status: BumpingStatusType;
  startedAt?: string;
  endedAt?: string;
  duration: number;
  succeeded: number;
  failed: number;
  isMaxFailedBumpsReached: boolean;
  reason?: CancellationReason;
}

export type CancellationReason =
  | "USER_REQUEST"
  | "USER_ACTIVITY"
  | "MAX_FAILED_ATTEMPTS";
