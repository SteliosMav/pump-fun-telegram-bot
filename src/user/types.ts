import { HydratedDocument, Model, QueryWithHelpers } from "mongoose";
import { UserModel } from "./user-model";

export interface UserRaw {
  telegramId: number;
  encryptedPrivateKey: string;
  firstName: string;
  isBot: boolean;
  bumpsCounter: number;
  tokenPassesTotal: number;
  tokenPassesUsed: number;
  bumpIntervalInSeconds: number;
  bumpAmount: number;
  bumpsLimit: number;
  slippage: number;
  priorityFee: number;
  pumpFunAccIsSet: boolean;
  tokenPass: Map<
    string,
    {
      createdAt: string;
      expirationDate?: string;
    }
  >;
  serviceFeePass?: {
    createdAt: string;
    expirationDate?: string;
  };
  lastName?: string;
  username?: string;
  lastBumpAt?: string;
  hasBannedBot?: boolean;
}

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

export type UserModelType = Model<
  UserRaw,
  UserQueries,
  UserMethods,
  UserVirtuals
> &
  UserStatics;

export type UserDoc = InstanceType<typeof UserModel>;
