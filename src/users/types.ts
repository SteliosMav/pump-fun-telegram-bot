/**
 * @WARNING Keep this interface in sync with the Mongoose schema!
 *
 * Any changes to this interface (e.g., adding, removing, or modifying fields)
 * must also be reflected in the corresponding Mongoose schema to avoid
 * inconsistencies and runtime errors.
 *
 * @Usage This interface is used for compile-time type checking only and does not
 * affect runtime behavior.
 */
export interface User {
  _id: string; // MongoDB ObjectId. Automatically generated. Currently not used.
  telegramId: number; // From Telegram. Identifier for the user. Unique.
  privateKey: string; // User's wallet private key
  firstName: string; // From Telegram
  isBot: boolean; // From Telegram
  /**
   * @description Number of successful bumps. This is an approximate value and
   * not guaranteed to be accurate. Jito doesn't wait for the success response
   * of a bump, so the exact count of successful bumps may not always match this.
   */
  bumpsCounter: number;
  /**
   * @description Total number of token passes. By subtracting tokenPassesUsed
   * from this, we get the number of token passes left
   */
  tokenPassesTotal: number;
  tokenPassesUsed: number; // Number of token passes used
  bumpIntervalInSeconds: number; // Time between each bump: e.g. 1 to 60 seconds
  bumpAmount: number; // Amount of SOL to bump with: e.g. 0.5763 - No more than 4 decimal places. The rest doesn't show on the pump.fun website
  bumpsLimit: number; // Number of bumps to perform
  slippage: number; // Stored as a decimal (e.g. 1% is stored as 0.01) - No more than 2 decimal places
  priorityFee: number; // Used for JITO tip. Stored as decimal. Minimum is 0.00001 SOL
  pumpFunAccIsSet: boolean; // Whether the pump.fun account for user's wallet is set
  /**
   * @description Map of token passes. Key is the token address. Users with token
   * passes can bump without paying the service fee for the associated token
   */
  tokenPass: {
    [key: string]: {
      createdAt: string;
      expirationDate?: string;
    };
  };
  serviceFeePass?: {
    createdAt: string;
    expirationDate?: string;
  }; // Users who have a service fee pass can bump without paying the service fee
  createdAt: string; // Stored as ISO 8601 text
  updatedAt: string; // Stored as ISO 8601 text
  lastName?: string; // From Telegram
  /**
   * @description // From Telegram. Useful for searching and chatting with
   * the user on Telegram. Without the username we can't send messages to the user.
   */
  username?: string;
  lastBumpAt?: string; // Stored as ISO
}
export type BumpSettings = Pick<
  User,
  | "bumpAmount"
  | "priorityFee"
  | "bumpIntervalInSeconds"
  | "slippage"
  | "bumpsLimit"
>;
