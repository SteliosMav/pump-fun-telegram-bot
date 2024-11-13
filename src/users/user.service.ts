import CryptoJS from "crypto-js";
import {
  BOT_DESCRIPTION,
  BOT_IMAGE,
  BOT_NAME,
  ENCRYPTION_KEY,
} from "src/constants";
import { User, UserModel } from "./types";
import { Database } from "sqlite3";
import { PumpFunService } from "src/pump-fun/pump-fun.service";

export class UserService {
  constructor(private _db: Database) {}

  async create(user: User): Promise<User | null> {
    // Encrypt the private key
    const encryptedPrivateKey = this._encryptPrivateKey(user.privateKey);

    return new Promise((resolve, reject) => {
      this._db.run(
        `INSERT INTO users (
            telegramId, encryptedPrivateKey, firstName, isBot, 
            bumpsCounter, freePassesTotal, freePassesUsed,
            bumpIntervalInSeconds, bumpAmount, slippagePercentage, 
            priorityFee, createdAt, updatedAt, lastName, username
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.telegramId,
          encryptedPrivateKey,
          user.firstName,
          user.isBot ? 1 : 0,
          user.bumpsCounter,
          user.freePassesTotal,
          user.freePassesUsed,
          user.bumpIntervalInSeconds,
          user.bumpAmount,
          user.slippage,
          user.priorityFee,
          user.createdAt,
          user.updatedAt,
          user.lastName,
          user.username,
        ],
        (err) => {
          if (err) {
            console.error("Error creating user:", err.message);
            reject(err);
          } else {
            resolve(user);
          }
        }
      );
    });
  }

  async getUser(telegramId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this._db.get<UserModel>(
        "SELECT * FROM users WHERE telegramId = ?",
        [telegramId],
        (err, row) => {
          if (err) {
            console.error("Error executing query:", err.message);
            reject(err);
          } else {
            if (row) {
              // Decrypt the private key if the row is found
              const { encryptedPrivateKey, ...userWithoutPrivateKey } = row;
              const privateKey = this._decryptPrivateKey(encryptedPrivateKey);
              const user: User = {
                ...userWithoutPrivateKey,
                privateKey,
              };
              resolve(user);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async getPrivateKey(telegramId: number): Promise<string | null> {
    // Return a promise to handle asynchronous behavior
    return new Promise((resolve, reject) => {
      this._db.get<UserModel>(
        "SELECT encryptedPrivateKey FROM users WHERE telegramId = ?",
        [telegramId],
        (err, row) => {
          if (err) {
            console.error("Error executing query:", err.message);
            return reject(err);
          }

          if (row) {
            // Decrypt the private key if the row is found
            const privateKey = this._decryptPrivateKey(row.encryptedPrivateKey);
            resolve(privateKey);
          } else {
            resolve(null); // Resolve as null if user is not found
          }
        }
      );
    });
  }

  async getFreePasses(telegramId: number): Promise<number | null> {
    try {
      // Fetch the user from the database
      const row = await new Promise<UserModel | undefined>(
        (resolve, reject) => {
          this._db.get<UserModel>(
            "SELECT freePassesTotal, freePassesUsed FROM users WHERE telegramId = ?",
            [telegramId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        }
      );

      // If the user is not found, return null
      if (!row) return null;

      // Calculate the free passes left
      const freePassesLeft = row.freePassesTotal - row.freePassesUsed;
      return freePassesLeft;
    } catch (err) {
      console.error("Error in getFreePasses:", err);
      return null;
    }
  }

  async giveFreePass(telegramId: number): Promise<number | null> {
    try {
      // Fetch the user from the database
      const row = await new Promise<UserModel | undefined>(
        (resolve, reject) => {
          this._db.get<UserModel>(
            "SELECT * FROM users WHERE telegramId = ?",
            [telegramId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        }
      );

      // If the user is not found, return null
      if (!row) return null;

      // Update the freePassesTotal
      const updatedFreePassesTotal = row.freePassesTotal + 1;

      // Perform the update query
      await new Promise<void>((resolve, reject) => {
        this._db.run(
          `UPDATE users SET freePassesTotal = ? WHERE telegramId = ?`,
          [updatedFreePassesTotal, telegramId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Free passes left
      const freePassesLeft = updatedFreePassesTotal - row.freePassesUsed;
      return freePassesLeft;
    } catch (err) {
      console.error("Error in giveFreePass:", err);
      return null;
    }
  }

  /**
   * Update the bump amount for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newBumpAmount - The new bump amount to set.
   * @returns A boolean indicating if the update was successful.
   */
  async updateBumpAmount(
    telegramId: number,
    newBumpAmount: number
  ): Promise<number> {
    // Define the keys to update with type safety
    const keyToUpdate: keyof User = "bumpAmount";
    const updatedAtKey: keyof User = "updatedAt";

    console.log("Telegram ID: ", telegramId);
    console.log("New bump amount: ", newBumpAmount);

    return new Promise((resolve, reject) => {
      this._db.run(
        `UPDATE users SET ${keyToUpdate} = ?, ${updatedAtKey} = ? WHERE telegramId = ?`,
        [newBumpAmount, new Date().toISOString(), telegramId],
        (err) => {
          if (err) {
            console.error("Error updating bump amount:", err.message);
            reject(err);
          } else {
            resolve(newBumpAmount);
          }
        }
      );
    });
  }

  /**
   * Update the interval value for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newInterval - The new interval to set.
   * @returns A boolean indicating if the update was successful.
   */
  async updateInterval(
    telegramId: number,
    newInterval: number
  ): Promise<number> {
    // Define the keys to update with type safety
    const keyToUpdate: keyof User = "bumpIntervalInSeconds";
    const updatedAtKey: keyof User = "updatedAt";

    return new Promise((resolve, reject) => {
      this._db.run(
        `UPDATE users SET ${keyToUpdate} = ?, ${updatedAtKey} = ? WHERE telegramId = ?`,
        [newInterval, new Date().toISOString(), telegramId],
        (err) => {
          if (err) {
            console.error(`Error updating ${keyToUpdate}:`, err.message);
            reject(err);
          } else {
            resolve(newInterval);
          }
        }
      );
    });
  }

  /**
   * Update the slippage value for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newSlippage - The new slippage value to set.
   * @returns A boolean indicating if the update was successful.
   */
  async updateSlippage(
    telegramId: number,
    newSlippage: number
  ): Promise<number> {
    // Define the keys to update with type safety
    const keyToUpdate: keyof User = "slippage";
    const updatedAtKey: keyof User = "updatedAt";

    return new Promise((resolve, reject) => {
      this._db.run(
        `UPDATE users SET ${keyToUpdate} = ?, ${updatedAtKey} = ? WHERE telegramId = ?`,
        [newSlippage, new Date().toISOString(), telegramId],
        (err) => {
          if (err) {
            console.error(`Error updating ${keyToUpdate}:`, err.message);
            reject(err);
          } else {
            resolve(newSlippage);
          }
        }
      );
    });
  }

  /**
   * Update the priority fee for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newPriorityFee - The new priority fee value to set.
   * @returns A boolean indicating if the update was successful.
   */
  async updatePriorityFee(
    telegramId: number,
    newPriorityFee: number
  ): Promise<number> {
    // Define the keys to update with type safety
    const keyToUpdate: keyof User = "priorityFee";
    const updatedAtKey: keyof User = "updatedAt";

    return new Promise((resolve, reject) => {
      this._db.run(
        `UPDATE users SET ${keyToUpdate} = ?, ${updatedAtKey} = ? WHERE telegramId = ?`,
        [newPriorityFee, new Date().toISOString(), telegramId],
        (err) => {
          if (err) {
            console.error(`Error updating ${keyToUpdate}:`, err.message);
            reject(err);
          } else {
            resolve(newPriorityFee);
          }
        }
      );
    });
  }

  async setUpUsersPumpFunAcc(
    telegramId: number,
    privateKey: string
  ): Promise<void> {
    try {
      const pumpFunService = new PumpFunService();
      const authCookie = await pumpFunService.login(privateKey);
      if (!authCookie) return;

      await pumpFunService.updateProfile(
        BOT_NAME,
        BOT_IMAGE,
        BOT_DESCRIPTION,
        authCookie
      );

      // Update user in db that pump fun account is set
      // ...
      // Define the keys to update with type safety
      const keyToUpdate: keyof User = "pumpFunAccIsSet";
      const updatedAtKey: keyof User = "updatedAt";

      await new Promise((resolve, reject) => {
        this._db.run(
          `UPDATE users SET ${keyToUpdate} = ?, ${updatedAtKey} = ? WHERE telegramId = ?`,
          [1, new Date().toISOString(), telegramId],
          (err) => {
            if (err) {
              console.error(`Error updating ${keyToUpdate}:`, err.message);
              reject(err);
            } else {
              resolve(true);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error updating users pump fun account:", error);
    }
  }

  /**
   * Increment the bumps counter by a specified amount for a user.
   * @param telegramId - The user's Telegram ID.
   * @param bumpAmount - The amount to increment the bumps counter.
   * @returns A Promise resolving to the new bumpsCounter value.
   */
  async incrementBumpsCounter(
    telegramId: number,
    bumpAmount: number
  ): Promise<boolean | null> {
    const counterKey: keyof User = "bumpsCounter";
    const updatedAtKey: keyof User = "updatedAt";

    try {
      const res = await new Promise((resolve, reject) => {
        this._db.run(
          `UPDATE users SET ${counterKey} = ${counterKey} + ?, ${updatedAtKey} = ? WHERE telegramId = ?`,
          [bumpAmount, new Date().toISOString(), telegramId],
          function (err) {
            if (err) {
              console.error(`Error updating ${counterKey}:`, err.message);
              reject(err);
            } else {
              resolve(this.changes ? bumpAmount : 0);
            }
          }
        );
      });
      return true;
    } catch (error) {
      console.error("Error incrementing bumps counter:", error);
      return null;
    }
  }

  private _encryptPrivateKey(privateKey: string) {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  }

  private _decryptPrivateKey(encryptedPrivateKey: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
