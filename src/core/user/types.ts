import { HydratedDocument, Model, QueryWithHelpers } from "mongoose";

// Both required and default fields are mandatory, but default fields are
// not needed during user initialization as they get default values from mongoose,
// whereas required fields must be provided because their values can't be guessed.
export interface UserRequiredFields {
  encryptedPrivateKey: string;
  telegram: TelegramInfo;
}
interface UserDefaultFields {
  role: "USER" | "ADMIN";
  paidBumps: number;
  totalTokenPasses: number;
  bumpSettings: BumpSettings;
  isPumpFunAccountSet: boolean;
  usedTokenPasses: Map<string, TokenPass>;
  createdAt: Date;
  updatedAt: Date;
}
interface UserOptionalFields {
  servicePass?: ServicePass;
  lastBumpAt?: Date;
}
export interface UserRaw
  extends UserRequiredFields,
    UserDefaultFields,
    UserOptionalFields {}

export interface TelegramInfo {
  id: number;
  firstName: string;
  isBot: boolean;
  hasBannedBot?: boolean;
  lastName?: string;
  username?: string;
}

export interface BumpSettings {
  intervalInSeconds: number;
  amountInSol: number;
  limit: number;
  slippage: number;
  priorityFeeInSol: number;
}

interface BasicPass {
  bumps: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface TokenPass extends BasicPass {}
export interface ServicePass extends BasicPass {
  expiresAt?: Date;
}

export interface UserVirtuals {
  publicKey: string;
  tokenPassesLeft: number;
  hasServicePass: boolean;
  isAdmin: boolean;
}

export interface UserMethods {
  getPrivateKey(): string;
  hasPassFor(mint: string): boolean;
}

export interface UserStatics {}

export type UserQuery = QueryWithHelpers<
  HydratedDocument<UserRaw, UserMethods & UserVirtuals>[],
  HydratedDocument<UserRaw, UserMethods & UserVirtuals>,
  UserQueryHelpers
>;

export interface UserQueryHelpers {
  hasUsedBot(this: UserQuery, hasUsed?: boolean): this;
  hasBannedBot(this: UserQuery, hasBanned?: boolean): this;
}

export type UserModelType = Model<
  UserRaw,
  UserQueryHelpers,
  UserMethods,
  UserVirtuals
> &
  UserStatics;

export type UserDoc = HydratedDocument<
  UserRaw,
  UserMethods & UserVirtuals,
  UserQueryHelpers
>;
