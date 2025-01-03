import { HydratedDocument, Model, QueryWithHelpers } from "mongoose";

interface UserRequiredFields {
  telegramId: number;
  encryptedPrivateKey: string;
  firstName: string;
  isBot: boolean;
}
interface UserDefaultFields {
  bumpsCounter: number;
  tokenPassesTotal: number;
  tokenPassesUsed: number;
  bumpSettings: BumpSettings;
  pumpFunAccIsSet: boolean;
  tokenPass: Map<string, TokenPass>;
}
interface UserOptionalFields {
  serviceFeePass?: ServicePass;
  lastName?: string;
  username?: string;
  lastBumpAt?: string;
  hasBannedBot?: boolean;
}
export interface UserRaw
  extends UserRequiredFields,
    UserDefaultFields,
    UserOptionalFields {}

export interface BumpSettings {
  intervalInSeconds: number;
  amount: number;
  limit: number;
  slippage: number;
  priorityFee: number;
}

interface BasicPass {
  createdAt: string;
  expirationDate?: string;
}
export interface TokenPass extends BasicPass {}
export interface ServicePass extends BasicPass {}

export interface UserMethods {
  hasPassForToken(mint: string): boolean;
}

export interface UserVirtuals {
  privateKey: string;
  hasServicePass: boolean;
}

export interface UserStatics {
  findByTgId(
    tgId: number
  ): Promise<HydratedDocument<UserRaw, UserMethods & UserVirtuals>[]>;
}

type UserQueryThis = QueryWithHelpers<
  HydratedDocument<UserRaw>[],
  HydratedDocument<UserRaw>,
  UserQueries
>;
export interface UserQueries {
  hasUsedBot(this: UserQueryThis, hasUsed?: boolean): this;
  hasBannedBot(this: UserQueryThis, hasBanned?: boolean): this;
}

/**
 * Overwriting `new` method enforces strict typing for the payload when creating new user documents.
 * Without it, TypeScript doesn't validate the payload strictly during instantiation.
 * It would treat the raw document as optional and allow extra, undefined fields.
 */
export interface UserModelType
  extends Omit<Model<UserRaw, UserQueries, UserMethods, UserVirtuals>, "new"> {
  new (
    data: UserRequiredFields & Partial<UserDefaultFields & UserOptionalFields>
  ): HydratedDocument<UserRaw, UserMethods & UserVirtuals>;
}

export type UserDoc = HydratedDocument<UserRaw, UserMethods & UserVirtuals>;
