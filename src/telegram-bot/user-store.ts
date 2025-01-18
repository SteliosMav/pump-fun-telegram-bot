import { CallbackType } from "./types";

export interface UserState {
  lastCallback?: CallbackType | null;
  stopBumping: boolean;
  isBumping: boolean;
  createdAt: string; // Date iso
}

export class UserStore {
  private map: Map<number, UserState>;

  constructor() {
    this.map = new Map<number, UserState>();
  }

  get(userId: number): UserState | undefined {
    return this.map.get(userId);
  }

  set(userId: number, state: UserState): void {
    this.map.set(userId, state);
  }

  cleanUserStates(intervalMs: number): void {
    const expirationTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    setInterval(() => {
      const now = Date.now();

      this.map.forEach((userState, userId) => {
        const createdAtTimestamp = new Date(userState.createdAt).getTime(); // Convert ISO string to timestamp
        if (!userState.isBumping && now - createdAtTimestamp > expirationTime) {
          this.remove(userId); // Remove inactive user states
        }
      });
    }, expirationTime); // Run every 15 minutes
  }

  private remove(userId: number): void {
    this.map.delete(userId);
  }
}
