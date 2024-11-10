export type UserModel = Omit<User, "privateKey"> & {
  encryptedPrivateKey: string;
};

export interface User {
  telegramId: number;
  privateKey: string;
  firstName: string;
  isBot: boolean;
  bumpsCounter: number;
  freePassesTotal: number;
  freePassesUsed: number;
  bumpIntervalInSeconds: number; // 1 to 60 seconds
  bumpAmount: number; // e.g. 0.5763 - No more than 4 decimal places
  slippagePercentage: number; // Stored as a decimal (e.g. 1% is stored as 0.01) - No more than 2 decimal places
  priorityFee: number; // Stored as decimal (e.g. 0.02) - No more than 2 decimal places
  createdAt: string; // Stored as ISO 8601 text
  updatedAt: string; // Stored as ISO 8601 text
  lastName?: string;
  username?: string;
}
export type UserDefaultValues = Pick<
  User,
  | "bumpsCounter"
  | "freePassesTotal"
  | "freePassesUsed"
  | "bumpAmount"
  | "priorityFee"
  | "bumpIntervalInSeconds"
  | "slippagePercentage"
>;
