import { HydratedDocument, Model, QueryWithHelpers } from "mongoose";

/**
 * Optional fields (not-required or without default) values should be:
 * - Truly optional: Information that doesn’t apply to every user or isn’t critical to functionality.
 * - Meaningful when absent: Where absence communicates something useful, like the lack of interaction or missing user input.
 * - Not needed for critical logic: If a field is critical for system operation, it should have a default.
 */
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

export interface UserVirtuals {
  hasServicePass: boolean;
}

export interface UserMethods {
  hasPassForToken(mint: string): boolean;
  getPrivateKey(): string;
}

export interface UserStatics {
  findByTgId(tgId: number): UserQuery;
}

export type UserQuery = QueryWithHelpers<
  HydratedDocument<UserRaw, UserMethods & UserVirtuals>[],
  HydratedDocument<UserRaw, UserMethods & UserVirtuals>,
  UserQueryHelpers
>;

export interface UserQueryHelpers {
  hasUsedBot(this: UserQuery, hasUsed?: boolean): this;
  hasBannedBot(this: UserQuery, hasBanned?: boolean): this;
}

/**
 * This approach ensures strict typing for `UserModelOptions` while keeping it flexible:
 * - Dynamically references fields (like `bumpSettings`) without hardcoding, ensuring maintainability.
 * - Makes all default fields optional, with specific support for partial nested properties.
 */
type Key = keyof Pick<UserDefaultFields, "bumpSettings">;
type Value = UserDefaultFields[Key];
type UserModelOptions = UserRequiredFields &
  Partial<Omit<UserDefaultFields, Key>> & {
    [K in Key]?: Partial<Value>;
  } & Partial<UserOptionalFields>;

/**
 * Overwriting `new` method enforces strict typing for the payload when creating new user documents.
 * Without it, TypeScript doesn't validate the payload strictly during instantiation.
 * It would treat the raw document as optional and allow extra, undefined fields.
 */
export interface UserModelType
  extends Omit<
    Model<UserRaw, UserQueryHelpers, UserMethods, UserVirtuals> & UserStatics,
    "new"
  > {
  new (data: UserModelOptions): HydratedDocument<
    UserRaw,
    UserMethods & UserVirtuals
  >;
}

export type UserDoc = HydratedDocument<
  UserRaw,
  UserMethods & UserVirtuals,
  UserQueryHelpers
>;
