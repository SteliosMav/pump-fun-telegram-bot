import { Injectable } from "@nestjs/common";
import {
  ServicePass,
  TelegramInfo,
  TokenPass,
  UserDoc,
  UserModelType,
  UserRaw,
  UserRequiredFields,
  UserVirtuals,
} from "./types";
import { InjectModel } from "@nestjs/mongoose";
import { DeleteResult, UpdateWriteOpResult } from "mongoose";
import { CryptoService } from "../crypto";
import { toKeypair } from "../solana";

@Injectable()
export class UserRepository {
  private get telegramIdPath(): string {
    const telegramKey: keyof Pick<UserRaw, "telegram"> = "telegram";
    const idKey: keyof Pick<TelegramInfo, "id"> = "id";
    return `${telegramKey}.${idKey}`;
  }

  constructor(
    @InjectModel("User") private readonly UserModel: UserModelType,
    private readonly cryptoService: CryptoService
  ) {}

  create(user: Partial<UserRaw> & UserRequiredFields): Promise<UserDoc> {
    return this.UserModel.create(user);
  }

  findOne(telegramId: number): Promise<UserDoc | null> {
    return this.UserModel.findOne({ [this.telegramIdPath]: telegramId });
  }

  findReachableUsers(): Promise<number[]> {
    return this.UserModel.find(
      { "telegram.hasBannedBot": { $ne: true } },
      { _id: 0, [this.telegramIdPath]: 1 }
    ).then((users) => users.map((user) => user.telegram.id));
  }

  /**
   * Includes virtual field `publicKey` in the response
   */
  findPumpFunAccountsToUpdate(): Promise<
    ({
      [K in keyof Pick<UserRaw, "telegram">]: Pick<UserRaw["telegram"], "id">;
    } & Pick<UserVirtuals, "publicKey">)[]
  > {
    return this.UserModel.find(
      { isPumpFunAccountSet: false },
      { [this.telegramIdPath]: 1, encryptedPrivateKey: 1, _id: 0 }
    )
      .lean()
      .then((users) =>
        users.map(({ encryptedPrivateKey, ...rest }) => {
          const decryptedPrivateKey =
            this.cryptoService.decryptPrivateKey(encryptedPrivateKey);
          const publicKey = toKeypair(decryptedPrivateKey).publicKey.toBase58();
          return { ...rest, publicKey };
        })
      );
  }

  /**
   * Delete duplicates having the same createdAt and updatedAt fields as
   * well as telegram ID. This issue can occur from a migration script.
   */
  async deleteDuplicates(): Promise<DeleteResult> {
    const duplicates = await this.UserModel.aggregate([
      {
        $group: {
          _id: {
            telegramId: "$telegram.id",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $project: { _id: 0, ids: 1 } },
    ]);
    console.log("Duplicates:", duplicates.length);

    // Flatten all IDs to be deleted (excluding one per group)
    const toBeDeleted = duplicates.flatMap(({ ids }) => ids.slice(1));
    console.log("To be deleted:", toBeDeleted.length);

    return this.UserModel.deleteMany({ _id: { $in: toBeDeleted } });
  }

  /**
   * It will update partially only root level fields. Nested ones will be
   * overwritten.
   */
  updateOne(
    telegramId: number,
    update: Partial<UserRaw>
  ): Promise<UserDoc | null> {
    return this.UserModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      update,
      { new: true, runValidators: true }
    );
  }

  /**
   * It will update partially only root level fields. Nested ones will be
   * overwritten.
   */
  updateMany(
    telegramId: number[],
    update: Partial<UserRaw>
  ): Promise<UpdateWriteOpResult> {
    return this.UserModel.updateMany(
      { [this.telegramIdPath]: telegramId },
      update,
      {
        runValidators: true,
      }
    );
  }

  /**
   * Updates the telegram info of one or many users, partially.
   */
  updateTelegramInfo(
    telegramId: number,
    updates: Partial<UserRaw["telegram"]>
  ): Promise<UserDoc | null>;
  updateTelegramInfo(
    telegramId: number[],
    updates: Partial<UserRaw["telegram"]>
  ): Promise<UpdateWriteOpResult>;
  updateTelegramInfo(
    telegramIdOrIds: number | number[],
    updates: Partial<UserRaw["telegram"]>
  ): Promise<UserDoc | null | UpdateWriteOpResult> {
    const update: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      update[`telegram.${key}`] = value;
    }

    if (Array.isArray(telegramIdOrIds)) {
      // Update multiple users
      return this.UserModel.updateMany(
        { [this.telegramIdPath]: { $in: telegramIdOrIds } },
        { $set: update },
        { runValidators: true }
      );
    } else {
      // Update a single user
      return this.UserModel.findOneAndUpdate(
        { [this.telegramIdPath]: telegramIdOrIds },
        { $set: update },
        { new: true, runValidators: true }
      );
    }
  }

  /**
   * Updates the bump settings of one or many users, partially.
   */
  updateBumpSettings(
    telegramId: number,
    updates: Partial<UserRaw["bumpSettings"]>
  ): Promise<UserDoc | null>;
  updateBumpSettings(
    telegramId: number[],
    updates: Partial<UserRaw["bumpSettings"]>
  ): Promise<UpdateWriteOpResult>;
  updateBumpSettings(
    telegramIdOrIds: number | number[],
    updates: Partial<UserRaw["bumpSettings"]>
  ): Promise<UserDoc | null | UpdateWriteOpResult> {
    const update: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      update[`bumpSettings.${key}`] = value;
    }

    if (Array.isArray(telegramIdOrIds)) {
      // Update multiple users
      return this.UserModel.updateMany(
        { [this.telegramIdPath]: { $in: telegramIdOrIds } },
        { $set: update },
        { runValidators: true }
      );
    } else {
      // Update a single user
      return this.UserModel.findOneAndUpdate(
        { [this.telegramIdPath]: telegramIdOrIds },
        { $set: update },
        { new: true, runValidators: true }
      );
    }
  }

  incrementTokenPassesLeft(
    telegramId: number,
    amount: number = 1
  ): Promise<UserDoc | null> {
    const update: Pick<UserRaw, "totalTokenPasses"> = {
      totalTokenPasses: amount,
    };
    return this.UserModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      { $inc: update },
      { new: true, runValidators: true }
    );
  }

  /**
   * @warning Before incrementing their servicePass bumps, validate that the user has a valid servicePass.
   *
   * Describe if the bumps came from a user who has service-pass, or token-pass for the specific
   * token he bumped or it was just a paid (as you go) bump.
   */
  incrementBumps(
    telegramId: number,
    amount: number,
    context: "paid" | "servicePass" | { tokenPass: string }
  ): Promise<UserDoc | null> {
    const dateNow = new Date();
    const update: Record<string, any> = {
      $set: { lastBumpAt: dateNow },
    };

    if (context === "paid") {
      const a: Pick<UserRaw, "paidBumps"> = { paidBumps: amount };
      update.$inc = a;
    } else if (context === "servicePass") {
      const servicePassKey: keyof Pick<UserRaw, "servicePass"> = "servicePass";
      const bumpsKey: keyof Pick<ServicePass, "bumps"> = "bumps";
      const updatedAtKey: keyof Pick<ServicePass, "updatedAt"> = "updatedAt";
      update.$inc = { [`${servicePassKey}.${bumpsKey}`]: amount };
      update.$set[`${servicePassKey}.${updatedAtKey}`] = dateNow;
    } else if (typeof context === "object" && "tokenPass" in context) {
      const usedTokenPassesKey: keyof Pick<UserRaw, "usedTokenPasses"> =
        "usedTokenPasses";
      const tokenKey = `${usedTokenPassesKey}.${context.tokenPass}`;
      const bumpsKey: keyof Pick<TokenPass, "bumps"> = "bumps";
      const updatedAtKey: keyof Pick<TokenPass, "updatedAt"> = "updatedAt";
      update.$inc = { [`${tokenKey}.${bumpsKey}`]: amount };
      update.$set[`${tokenKey}.${updatedAtKey}`] = dateNow;
    } else {
      throw new Error("Invalid context provided to increaseBumps");
    }

    return this.UserModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      update,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  addUsedTokenPass(
    telegramId: number,
    tokenMint: string
  ): Promise<UserDoc | null> {
    const usedTokenPassesKey: keyof Pick<UserRaw, "usedTokenPasses"> =
      "usedTokenPasses";
    const tokenPass: Omit<TokenPass, "createdAt" | "updatedAt"> = {
      bumps: 0,
    };
    return this.UserModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      { $set: { [`${usedTokenPassesKey}.${tokenMint}`]: tokenPass } },
      { new: true, runValidators: true }
    );
  }

  addServicePass(telegramId: number, expiresAt?: Date): Promise<UserDoc | null>;
  addServicePass(
    telegramIds: number[],
    expiresAt?: Date
  ): Promise<UpdateWriteOpResult>;
  addServicePass(
    telegramIdOrIds: number | number[],
    expiresAt?: Date
  ): Promise<UserDoc | null | UpdateWriteOpResult> {
    const update: Record<
      keyof Pick<UserRaw, "servicePass">,
      Omit<
        NonNullable<UserRaw["servicePass"]>,
        "createdAt" | "updatedAt" | "bumps"
      >
    > = { servicePass: {} };

    if (expiresAt) {
      update.servicePass.expiresAt = expiresAt;
    }

    if (Array.isArray(telegramIdOrIds)) {
      // Update multiple users
      return this.UserModel.updateMany(
        { [this.telegramIdPath]: { $in: telegramIdOrIds } },
        { $set: update },
        { runValidators: true }
      );
    } else {
      // Update a single user
      return this.UserModel.findOneAndUpdate(
        { [this.telegramIdPath]: telegramIdOrIds },
        { $set: update },
        { new: true, runValidators: true }
      );
    }
  }

  updateIsPumpFunAccountSet(
    telegramIds: number[],
    isSet: boolean
  ): Promise<UpdateWriteOpResult> {
    return this.UserModel.updateMany(
      { [this.telegramIdPath]: { $in: telegramIds } },
      { $set: { isPumpFunAccountSet: isSet } },
      { runValidators: true }
    );
  }
}
