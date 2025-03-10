import { UserService } from "../../../../core/user/user.service";
import json from "./old-data-formatted.json";
import _ from "lodash";
import fs from "fs";
import { UserDoc, UserRaw } from "../../../../core/user/types";
import { delay } from "../../../../shared/utils";
import { validationRules } from "../../../../shared/validation-rules";

export async function insertToDb(userService: UserService): Promise<string> {
  const formatted = json.map((item: any) => {
    // Object usedTokenPasses to Map
    const newUsedTokenPasses = new Map();
    Object.entries(item.usedTokenPasses).forEach(([key, value]: any) => {
      newUsedTokenPasses.set(key, {
        createdAt: new Date(value.createdAt),
        updatedAt: new Date(value.updatedAt),
        bumps: value.bumps,
      });
    });
    const newCreatedAt = new Date(item.createdAt);
    const newUpdatedAt = new Date(item.updatedAt);
    item.usedTokenPasses = newUsedTokenPasses;
    item.createdAt = newCreatedAt;
    item.updatedAt = newUpdatedAt;
    if (
      item.bumpSettings.slippage > validationRules.bumpSettings.slippage.max
    ) {
      item.bumpSettings.slippage = validationRules.bumpSettings.slippage.max;
    }
    if (
      item.bumpSettings.amountInSol >
      validationRules.bumpSettings.amountInSol.max
    ) {
      item.bumpSettings.amountInSol =
        validationRules.bumpSettings.amountInSol.max;
    }
    if (
      item.bumpSettings.priorityFeeInSol >
      validationRules.bumpSettings.priorityFeeInSol.max
    ) {
      item.bumpSettings.priorityFeeInSol =
        validationRules.bumpSettings.priorityFeeInSol.max;
    }
    if (
      item.bumpSettings.intervalInSeconds <
      validationRules.bumpSettings.intervalInSeconds.min
    ) {
      item.bumpSettings.intervalInSeconds =
        validationRules.bumpSettings.intervalInSeconds.min;
    }
    if (item.bumpSettings.limit < validationRules.bumpSettings.limit.min) {
      item.bumpSettings.limit = validationRules.bumpSettings.limit.min;
    }
    return item;
  });
  console.log(formatted);

  // // Insert to DB
  let counter = 0;
  for (const item of formatted) {
    counter++;
    await userService.createUser(item);
    console.log(`Inserted user ${counter}/${formatted.length}`);
    await delay(1000);
  }

  return `Finished.`;
}
