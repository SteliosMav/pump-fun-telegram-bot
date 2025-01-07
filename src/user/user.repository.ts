import {
  TokenPass,
  UserCreateOptions,
  UserDoc,
  UserIncrementableFields,
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

  increment(
    telegramId: number,
    field: UserIncrementableFields,
    amount: number = 1
  ): Promise<UserDoc | null> {
    return UserModel.findOneAndUpdate(
      { telegramId },
      { $inc: { [field]: amount } },
      { new: true, runValidators: true }
    );
  }

  addUsedTokenPass(
    telegramId: number,
    tokenMint: string
  ): Promise<UserDoc | null> {
    // Type the payload first and then pass it for more secure types
    const key: keyof Pick<UserRaw, "usedTokenPasses"> = "usedTokenPasses";
    const tokenPass: TokenPass = {
      createdAt: new Date(),
      bumps: 0,
    };
    return UserModel.findOneAndUpdate(
      { telegramId },
      { $set: { [`${key}.${tokenMint}`]: tokenPass } },
      { new: true, runValidators: true }
    );
  }

  addServicePass(telegramId: number): Promise<UserDoc | null> {
    const update: Pick<UserRaw, "servicePass"> = {
      servicePass: { createdAt: new Date(), bumps: 0 },
    };
    return UserModel.findOneAndUpdate({ telegramId }, update, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * @note add method that adds a certain amount of bumps to the totalBumps
   * and updates the last bump at property. Consider removing general incremental
   * method and adding another for adding token pass to the user.
   */
}
