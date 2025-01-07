import {
  TokenPass,
  UserCreateOptions,
  UserDoc,
  UserRaw,
  UserUpdateOptions,
} from "./types";
import { UserModel } from "./user-model";

export class UserRepository {
  create(user: UserCreateOptions): Promise<UserDoc> {
    return UserModel.create(user);
  }

  find(telegramId: number): Promise<UserDoc | null> {
    return UserModel.findOne({ telegramId: telegramId });
  }

  findNewsletterRecipients(): Promise<number[]> {
    return UserModel.find({}, { telegramId: 1, _id: 0 }).then((users) =>
      users.map((user) => user.telegramId)
    );
  }

  updateOne(
    telegramId: number,
    update: UserUpdateOptions
  ): Promise<UserDoc | null> {
    return UserModel.findOneAndUpdate({ telegramId }, update, {
      new: true,
      runValidators: true,
    });
  }

  updateMany(
    telegramId: number[],
    update: UserUpdateOptions
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    return UserModel.updateMany({ telegramId }, update, {
      runValidators: true,
    }).then((result) => ({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    }));
  }

  incrementTokenPasses(
    telegramId: number,
    amount: number = 1
  ): Promise<UserDoc | null> {
    const update: Pick<UserRaw, "totalTokenPasses"> = {
      totalTokenPasses: amount,
    };
    return UserModel.findOneAndUpdate(
      { telegramId },
      { $inc: update },
      { new: true, runValidators: true }
    );
  }

  incrementBumps(
    telegramId: number,
    amount: number,
    context: "paid" | "servicePass" | { tokenPass: string }
  ): Promise<UserDoc | null> {
    const dateNow = new Date();
    const match: Record<string, any> = { telegramId };
    const update: Record<string, any> = {
      $set: { lastBumpAt: dateNow },
    };

    /**
     * @warning add types for payloads and keys
     */

    if (context === "paid") {
      update.$inc = { paidBumps: amount };
    } else if (context === "servicePass") {
      match.servicePass = { $type: "object" };
      update.$inc = { "servicePass.bumps": amount };
      update.$set["servicePass.updatedAt"] = dateNow;
    } else if (typeof context === "object" && "tokenPass" in context) {
      const tokenKey = `usedTokenPasses.${context.tokenPass}`;
      update.$inc = { [`${tokenKey}.bumps`]: amount };
      update.$set[`${tokenKey}.updatedAt`] = dateNow;
    } else {
      throw new Error("Invalid context provided to increaseBumps");
    }

    return UserModel.findOneAndUpdate(match, update, {
      new: true,
      runValidators: true,
    });
  }

  addUsedTokenPass(
    telegramId: number,
    tokenMint: string
  ): Promise<UserDoc | null> {
    const key: keyof Pick<UserRaw, "usedTokenPasses"> = "usedTokenPasses";
    const tokenPass: Omit<TokenPass, "createdAt" | "updatedAt"> = {
      bumps: 0,
    };
    return UserModel.findOneAndUpdate(
      { telegramId },
      { $set: { [`${key}.${tokenMint}`]: tokenPass } },
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

    return UserModel.findOneAndUpdate({ telegramId }, update, {
      new: true,
      runValidators: true,
    });
  }
}
