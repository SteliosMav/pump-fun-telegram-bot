import {
  TokenPass,
  UserCreateOptions,
  UserDoc,
  UserIncrementableFields,
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
    tokenId: string
  ): Promise<UserDoc | null> {
    const tokenPass: TokenPass = { createdAt: new Date().toISOString() };
    return UserModel.findOneAndUpdate(
      { telegramId },
      { $set: { [`usedTokenPasses.${tokenId}`]: tokenPass } },
      { new: true, runValidators: true }
    );
  }

  addServicePass(telegramId: number): Promise<UserDoc | null> {
    return UserModel.findOneAndUpdate(
      { telegramId },
      { servicePass: { createdAt: new Date().toISOString() } },
      {
        new: true,
        runValidators: true,
      }
    );
  }
}
