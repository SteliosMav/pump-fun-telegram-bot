import {
  BumpSettings,
  UserCreateOptions,
  UserDoc,
  UserIncrementableFields,
  UserRaw,
} from "./types";
import { UserModel } from "./user-model";

export class UserRepository {
  create(user: UserCreateOptions): Promise<UserDoc> {
    return UserModel.create(user);
  }

  async find(telegramId: number): Promise<UserDoc | null>;
  async find(telegramIds: number[]): Promise<UserDoc[]>;
  async find(
    tgIdOrIds: number | number[]
  ): Promise<UserDoc | UserDoc[] | null> {
    if (Array.isArray(tgIdOrIds)) {
      return UserModel.find({ telegramId: { $in: tgIdOrIds } });
    } else {
      return UserModel.findOne({ telegramId: tgIdOrIds });
    }
  }

  updateOne(
    telegramId: number,
    update: Partial<UserRaw>
  ): Promise<UserDoc | null> {
    return UserModel.findOneAndUpdate({ telegramId }, update, {
      new: true,
      runValidators: true,
    });
  }

  updateMany(
    telegramId: number[],
    update: Partial<UserRaw>
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    return UserModel.updateMany({ telegramId }, update, {
      runValidators: true,
    }).then((result) => ({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    }));
  }

  updateBumpSettings(
    telegramId: number,
    settings: Partial<BumpSettings>
  ): Promise<UserDoc | null> {
    return UserModel.findOneAndUpdate(
      { telegramId },
      { bumpSettings: settings },
      { new: true, runValidators: true }
    );
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
}
