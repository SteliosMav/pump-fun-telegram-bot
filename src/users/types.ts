export type UserModel = Omit<User, "privateKey"> & {
  encryptedPrivateKey: string;
};

export interface User {
  _id: string;
  telegramId: number;
  privateKey: string;
  firstName: string;
  isBot: boolean;
  bumpsCounter: number;
  lastBumpAt?: string; // Stored as ISO
  tokenPassesTotal: number;
  tokenPassesUsed: number;
  bumpIntervalInSeconds: number; // 1 to 60 seconds
  bumpAmount: number; // e.g. 0.5763 - No more than 4 decimal places
  bumpsLimit: number; // Number of bumps to perform
  slippage: number; // Stored as a decimal (e.g. 1% is stored as 0.01) - No more than 2 decimal places
  priorityFee: number; // Stored as decimal (e.g. 0.02) - No more than 2 decimal places
  pumpFunAccIsSet: boolean;
  tokenPass: {
    [key: string]: {
      createdAt: string;
      expirationDate?: string;
    };
  };
  serviceFeePass?: {
    createdAt: string;
    expirationDate?: string;
  };
  createdAt: string; // Stored as ISO 8601 text
  updatedAt: string; // Stored as ISO 8601 text
  lastName?: string;
  username?: string;
}
export type UserDefaultValues = Pick<
  User,
  | "bumpsCounter"
  | "tokenPassesTotal"
  | "tokenPassesUsed"
  | "bumpAmount"
  | "priorityFee"
  | "bumpIntervalInSeconds"
  | "slippage"
  | "bumpsLimit"
  | "tokenPass"
>;
