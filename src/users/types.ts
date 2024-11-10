export type UserModel = Omit<User, "privateKey"> & {
  encryptedPrivateKey: string;
};

export interface User {
  telegramId: number;
  privateKey: string;
  firstName: string;
  isBot: boolean;
  pumpsCounter: number;
  freePassesTotal: number;
  freePassesUsed: number;
  createdAt: string; // Stored as ISO 8601 text
  updatedAt: string; // Stored as ISO 8601 text
  lastName?: string;
  username?: string;
}
