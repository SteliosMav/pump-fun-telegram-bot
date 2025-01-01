import { HydratedDocument, Model } from "mongoose";
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
}

export interface UserMethods {
  hasPassForToken(mint: string): boolean;
}

export interface UserVirtuals {
  privateKey: string;
  hasServicePass: boolean;
}

export interface UserStatics {
  findByTgId(tgId: number): Promise<HydratedDocument<UserRaw>[]>;
}

export interface UserQueries {}

export type UserModelType = Model<
  UserRaw,
  UserQueries,
  UserMethods,
  UserVirtuals
>;

export type UserDoc = InstanceType<typeof UserModel>;

export type BumpSettings = Pick<
  UserDoc,
  | "bumpAmount"
  | "priorityFee"
  | "bumpIntervalInSeconds"
  | "slippage"
  | "bumpsLimit"
>;
