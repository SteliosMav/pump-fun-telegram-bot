import { UserModel } from "./user-model";

export type User = InstanceType<typeof UserModel>;
export type TokenPass = {
  createdAt: string;
  expirationDate?: string;
};
export type BumpSettings = Pick<
  User,
  | "bumpAmount"
  | "priorityFee"
  | "bumpIntervalInSeconds"
  | "slippage"
  | "bumpsLimit"
>;
