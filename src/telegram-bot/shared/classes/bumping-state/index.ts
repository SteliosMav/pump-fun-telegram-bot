import { BumpingStateJSON, BumpingStatusType } from "./types";

export class BumpingState {
  private _status: BumpingStatusType;
  private _startedAt?: Date;
  private _endedAt?: Date;
  private _succeeded: number = 0;
  private _failed: number = 0;
  private readonly _maxFailedBumps: number = 3;

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
  get isBumping(): boolean {
    return this._status === "BUMPING";
  }

  get isNotBumping(): boolean {
    return this._status === "NOT_BUMPING";
  }

  get shouldCancel(): boolean {
    return this._status === "SHOULD_CANCEL";
  }

  get status(): BumpingStatusType {
    return this._status;
  }

  /** Time Tracking Getters */
  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get endedAt(): Date | undefined {
    return this._endedAt;
  }

  get duration(): number {
    return this._startedAt && this._endedAt
      ? this._endedAt.getTime() - this._startedAt.getTime()
      : 0;
  }

  /** Session Data Getters */
  get failureCount(): number {
    return this._failed;
  }

  get successCount(): number {
    return this._succeeded;
  }

  /**
   * Checks if the max number of failed bumps has been reached.
   * @returns {boolean} True if the max failed bumps limit is reached, false otherwise.
   */
  get isMaxFailedBumpsReached(): boolean {
    return this._failed >= this._maxFailedBumps;
  }

  /** State Mutation Methods */
  startBumping(): void {
    this._status = "BUMPING";
    this._startedAt = new Date();
  }

  stopBumping(): void {
    this._status = "NOT_BUMPING";
    this._endedAt = new Date();
  }

  requestCancel(): void {
    this._status = "SHOULD_CANCEL";
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
      bumpStatus: this._status,
      duration: this.duration,
      startedAt: this._startedAt?.toISOString(),
      endedAt: this._endedAt?.toISOString(),
      succeeded: this._succeeded,
      failed: this._failed,
      isMaxFailedBumpsReached: this.isMaxFailedBumpsReached,
    };
  }
}
