import { UserService } from "../../../../core/user/user.service";
import json from "./pump_fun_bot.users.json";
import _ from "lodash";
import fs from "fs";
import { UserDoc, UserRaw } from "../../../../core/user/types";

export async function exportToFormattedJson(
  userService: UserService
): Promise<string> {
  // Create schema
  const schema: Record<string, any> = {};
  json.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (value) {
        if (typeof value === "object") {
          if (!_.isEmpty(value)) {
            schema[key] = value;
          }
        } else {
          schema[key] = value;
        }
      }
    });
  });
  console.log(schema);

  const dateNow = new Date();
  const formatted = json.map((item) => {
    const usedTokenPasses = new Map();
    if (item.tokenPass) {
      Object.entries(item.tokenPass as any).forEach(([key, value]: any) => {
        usedTokenPasses.set(key, {
          createdAt: new Date(value.createdAt),
          updatedAt: dateNow,
          bumps: 0,
        });
      });
    }
    console.log(usedTokenPasses);

    const newItem: UserRaw = {
      telegram: {
        id: item.telegramId,
        username: item.username,
        firstName: item.firstName,
        lastName: item.lastName,
        isBot: item.isBot,
      },
      bumpSettings: {
        amountInSol: item.bumpAmount,
        intervalInSeconds: item.bumpIntervalInSeconds,
        limit: item.bumpsLimit,
        slippage: item.slippage,
        priorityFeeInSol: item.priorityFee,
      },
      encryptedPrivateKey: item.encryptedPrivateKey,
      isPumpFunAccountSet: item.pumpFunAccIsSet,
      lastBumpAt: item.lastBumpAt ? new Date(item.lastBumpAt) : undefined,
      paidBumps: item.bumpsCounter,
      role: "USER",
      totalTokenPasses: item.tokenPassesTotal,
      usedTokenPasses,
      // item.tokenPass && !_.isEmpty(item.tokenPass)
      //   ? new Map(
      //       Object.entries(item.tokenPass).map(([key, value]) => [key, value])
      //     )
      //   : new Map(),
      createdAt: new Date(item.createdAt.$date),
      updatedAt: new Date(item.updatedAt.$date),
    };
    return newItem;
  });
  console.log(formatted);
  // Map map to object
  Object.entries(formatted).forEach(([key, value]) => {
    const usedTokenPasses = value.usedTokenPasses;
    const newUsedTokenPasses: Record<string, any> = {};
    usedTokenPasses.forEach((value, key) => {
      newUsedTokenPasses[key] = value;
    });
    (value as any).usedTokenPasses = newUsedTokenPasses;
  });

  // Export schema
  const path =
    "src/telegram-bot/script/scripts/migrate-database/old-data-formatted.json";
  fs.writeFileSync(path, JSON.stringify(formatted, null, 2));

  return `Finished.`;
}
