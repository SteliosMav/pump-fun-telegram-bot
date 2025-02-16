import { DateRange } from "../date-range";
import {
  BumpingStateJSON,
  BumpingStatusType,
  CancellationReason,
} from "./types";

export class BumpingState {
  private _status: BumpingStatusType;
  private _startedAt?: Date;
  private _endedAt?: Date;
  private _succeeded: number = 0;
  private _failed: number = 0;
  private readonly _maxFailedBumps: number = 3;
  private _reason?: CancellationReason;

  private constructor(status: BumpingStatusType) {
    this._status = status;
  }

  /**
   * Creates a new `BumpingState` in the default `"NOT_BUMPING"` state.
   * @returns {BumpingState} A new instance with default values.
   */
  static create(): BumpingState {
    return new BumpingState("NOT_BUMPING");
  }

  /** State Check Getters */
  get isNotBumping(): boolean {
    return this._status === "NOT_BUMPING";
  }

  get isBumping(): boolean {
    return this._status === "BUMPING";
  }

  get isFinished(): boolean {
    return this._status === "FINISHED";
  }

  get shouldCancel(): boolean {
    return this._status === "SHOULD_CANCEL";
  }

  get isCanceled(): boolean {
    return this._status === "CANCELED";
  }

  get isCanceledByUserRequest(): boolean {
    return this.isCanceled && this._reason === "USER_REQUEST";
  }

  get isCanceledByUserActivity(): boolean {
    return this.isCanceled && this._reason === "USER_ACTIVITY";
  }

  get isCanceledByFailedAttempts(): boolean {
    return this.isCanceled && this._reason === "MAX_FAILED_ATTEMPTS";
  }

  /** Time Tracking Getters */
  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get endedAt(): Date | undefined {
    return this._endedAt;
  }

  /** Returns the duration in milliseconds between the start and end times */
  get duration(): DateRange {
    const dateNow = new Date();
    return new DateRange(this.startedAt || dateNow, this.endedAt || dateNow);
  }

  /** Session Data Getters */
  get failureCount(): number {
    return this._failed;
  }

  get successCount(): number {
    return this._succeeded;
  }

  get maxFailedBumps(): number {
    return this._maxFailedBumps;
  }

  get isMaxFailedBumpsReached(): boolean {
    return this._failed >= this.maxFailedBumps;
  }

  get hasSuccessfulBumps(): boolean {
    return this.successCount > 0;
  }

  /** State Mutation Methods */
  started(): void {
    this._status = "BUMPING";
    this._startedAt = new Date();
  }

  finished(): void {
    this._status = "FINISHED";
    this._endedAt = new Date();
  }

  cancelBy(reason: CancellationReason): void {
    this._status = "SHOULD_CANCEL";
    this._reason = reason;
  }

  canceled(): void {
    this._status = "CANCELED";
    this._endedAt = new Date();
  }

  incrementSuccess(): void {
    this._succeeded++;
  }

  incrementFailure(): void {
    this._failed++;
  }

  /** Serializes the session into JSON. */
  toJSON(): BumpingStateJSON {
    return {
      status: this._status,
      startedAt: this._startedAt?.toISOString(),
      endedAt: this._endedAt?.toISOString(),
      succeeded: this._succeeded,
      failed: this._failed,
      isMaxFailedBumpsReached: this.isMaxFailedBumpsReached,
      reason: this._reason,
    };
  }
}
