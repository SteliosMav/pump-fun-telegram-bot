import { Injectable } from "@nestjs/common";
import {
  ServicePass,
  TelegramInfo,
  TokenPass,
  UserDoc,
  UserModelType,
  UserRaw,
} from "./types";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserRepository {
  private get telegramIdPath(): string {
    const telegramKey: keyof Pick<UserRaw, "telegram"> = "telegram";
    const idKey: keyof Pick<TelegramInfo, "id"> = "id";
    return `${telegramKey}.${idKey}`;
  }

  constructor(@InjectModel("User") private readonly userModel: UserModelType) {}

  create(
    user: Pick<UserRaw, "encryptedPrivateKey" | "telegram">
  ): Promise<UserDoc> {
    return this.userModel.create(user);
  }

  find(telegramId: number): Promise<UserDoc | null> {
    return this.userModel.findOne({ [this.telegramIdPath]: telegramId });
  }

  findNewsletterRecipients(): Promise<number[]> {
    return this.userModel
      .find({}, { [this.telegramIdPath]: 1, _id: 0 })
      .then((users) => users.map((user) => user.telegram.id));
  }

  updateOne(
    telegramId: number,
    update: Partial<UserRaw>
  ): Promise<UserDoc | null> {
    return this.userModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      update,
      { new: true, runValidators: true }
    );
  }

  updateMany(
    telegramId: number[],
    update: Partial<UserRaw>
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    return this.userModel
      .updateMany({ [this.telegramIdPath]: telegramId }, update, {
        runValidators: true,
      })
      .then((result) => ({
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      }));
  }

  updateTelegramInfo(
    telegramId: number,
    updates: Partial<UserRaw["telegram"]>
  ): Promise<UserDoc | null> {
    return this.setNestedProperties(telegramId, "telegram", updates);
  }

  updateBumpSettings(
    telegramId: number,
    updates: Partial<UserRaw["bumpSettings"]>
  ): Promise<UserDoc | null> {
    return this.setNestedProperties(telegramId, "bumpSettings", updates);
  }

  incrementTokenPassesLeft(
    telegramId: number,
    amount: number = 1
  ): Promise<UserDoc | null> {
    const update: Pick<UserRaw, "totalTokenPasses"> = {
      totalTokenPasses: amount,
    };
    return this.userModel.findOneAndUpdate(
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

    return this.userModel.findOneAndUpdate(
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
    return this.userModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      { $set: { [`${usedTokenPassesKey}.${tokenMint}`]: tokenPass } },
      { new: true, runValidators: true }
    );
  }

  addServicePass(
    telegramId: number,
    expirationDate?: Date
  ): Promise<UserDoc | null> {
    const update: Record<
      keyof Pick<UserRaw, "servicePass">,
      Omit<NonNullable<UserRaw["servicePass"]>, "createdAt" | "updatedAt">
    > = {
      servicePass: {
        bumps: 0,
      },
    };

    if (expirationDate) {
      update.servicePass.expirationDate = expirationDate;
    }

    return this.userModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      update,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  private setNestedProperties<T extends keyof UserRaw>(
    telegramId: number,
    field: T,
    updates: Partial<UserRaw[T]>
  ): Promise<UserDoc | null> {
    const update: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      update[`${field}.${key}`] = value;
    }

    return this.userModel.findOneAndUpdate(
      { [this.telegramIdPath]: telegramId },
      { $set: update },
      { new: true, runValidators: true }
    );
  }
}
