import { UserCreateOptions, UserDoc, UserUpdateOptions } from "./types";
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
    update: UserUpdateOptions,
    preserveNestedFields = true
  ): Promise<UserDoc | null> {
    const updateOperations = this.buildUpdateOperations(
      update,
      preserveNestedFields
    );
    return UserModel.findOneAndUpdate({ telegramId }, updateOperations, {
      new: true,
      runValidators: true,
    });
  }

  updateMany(
    telegramId: number[],
    update: UserUpdateOptions,
    preserveNestedFields = true
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const updateOperations = this.buildUpdateOperations(
      update,
      preserveNestedFields
    );
    return UserModel.updateMany({ telegramId }, updateOperations, {
      runValidators: true,
    }).then((result) => ({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    }));
  }

  /**
   * Improvement: Create type `FilterNumericValues` to enforce type safety for numeric-only updates.
   */
  increment(
    telegramId: number,
    increments: UserUpdateOptions
  ): Promise<UserDoc | null> {
    const updateOperations: Record<string, any> = { $inc: {} };

    const buildNestedIncrements = (
      obj: Record<string, any>,
      path: string[] = []
    ) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key].join(".");
        if (value && typeof value === "object" && !Array.isArray(value)) {
          buildNestedIncrements(value, [...path, key]);
        } else {
          updateOperations.$inc[currentPath] = value;
        }
      }
    };

    buildNestedIncrements(increments);

    return UserModel.findOneAndUpdate({ telegramId }, updateOperations, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * By default, MongoDB will overwrite nested objects entirely when updating.
   * This function provides the option to preserve existing nested fields in objects.
   *
   * @returns A MongoDB-compatible update operation object.
   */
  private buildUpdateOperations(
    update: UserUpdateOptions,
    preserveNestedFields: boolean
  ): Record<string, any> {
    if (!preserveNestedFields) {
      return update;
    }

    const operations: Record<string, any> = { $set: {} };

    const buildNestedUpdates = (
      obj: Record<string, any>,
      path: string[] = []
    ) => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key].join(".");
        if (value && typeof value === "object" && !Array.isArray(value)) {
          buildNestedUpdates(value, [...path, key]);
        } else {
          operations.$set[currentPath] = value;
        }
      }
    };

    buildNestedUpdates(update);
    return operations;
  }
}
