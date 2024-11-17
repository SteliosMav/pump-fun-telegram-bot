import CryptoJS from "crypto-js";
import {
  BOT_DESCRIPTION,
  BOT_IMAGE_GIF,
  BOT_USERNAME_BASE,
  ENCRYPTION_KEY,
} from "src/constants";
import { User, UserModel } from "./types";
import { Database } from "sqlite3";
import { PumpFunService } from "src/pump-fun/pump-fun.service";
import { IUserModel, UserDoc, UserModel as UserModelV2 } from "./user-model";
import { Document, ObjectId } from "mongoose";

export class UserService {
  constructor(private _db: Database) {}

  async create(user: User): Promise<User> {
    // Encrypt the private key
    const encryptedPrivateKey = this._encryptPrivateKey(user.privateKey);

    const newUser: Omit<IUserModel, "_id"> = {
      telegramId: user.telegramId,
      encryptedPrivateKey,
      firstName: user.firstName,
      isBot: user.isBot,
      bumpsCounter: user.bumpsCounter,
      freePassesTotal: user.freePassesTotal,
      freePassesUsed: user.freePassesUsed,
      bumpIntervalInSeconds: user.bumpIntervalInSeconds,
      pumpFunAccIsSet: user.pumpFunAccIsSet,
      bumpAmount: user.bumpAmount,
      slippage: user.slippage,
      priorityFee: user.priorityFee,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastName: user.lastName,
      username: user.username,
    };
    const toSave: UserDoc = new UserModelV2(newUser);

    const userDoc = await toSave.save();
    return this._docToJSON(userDoc);
  }

  async getUser(telegramId: number): Promise<User | null> {
    const userDoc = await UserModelV2.findOne({
      telegramId: telegramId,
    });
    return userDoc ? this._docToJSON(userDoc) : null;
  }

  // User only in draft for moving users to new db
  async getUsers(telegramIds?: number[]): Promise<User[]> {
    const query = telegramIds ? { telegramId: { $in: telegramIds } } : {};
    const userDocs = await UserModelV2.find(query);
    return userDocs.map((doc) => this._docToJSON(doc));
  }

  // async getPrivateKey(telegramId: number): Promise<string | null> {
  //   const telegramIdKey: keyof UserModel = "telegramId";
  //   const encryptedPrivateKeyKey: keyof UserModel = "encryptedPrivateKey";

  //   // Return a promise to handle asynchronous behavior
  //   return new Promise((resolve, reject) => {
  //     this._db.get<UserModel>(
  //       `SELECT ${encryptedPrivateKeyKey} FROM users WHERE ${telegramIdKey} = ?`,
  //       [telegramId],
  //       (err, row) => {
  //         if (err) {
  //           console.error("Error executing query:", err.message);
  //           return reject(err);
  //         }

  //         if (row) {
  //           // Decrypt the private key if the row is found
  //           const privateKey = this._decryptPrivateKey(row.encryptedPrivateKey);
  //           resolve(privateKey);
  //         } else {
  //           resolve(null); // Resolve as null if user is not found
  //         }
  //       }
  //     );
  //   });
  // }

  // async getFreePasses(telegramId: number): Promise<number | null> {
  //   const telegramIdKey: keyof UserModel = "telegramId";
  //   const freePassesTotalKey: keyof UserModel = "freePassesTotal";
  //   const freePassesUsedKey: keyof UserModel = "freePassesUsed";

  //   try {
  //     // Fetch the user from the database
  //     const row = await new Promise<UserModel | undefined>(
  //       (resolve, reject) => {
  //         this._db.get<UserModel>(
  //           `SELECT ${freePassesTotalKey}, ${freePassesUsedKey} FROM users WHERE ${telegramIdKey} = ?`,
  //           [telegramId],
  //           (err, row) => {
  //             if (err) reject(err);
  //             else resolve(row);
  //           }
  //         );
  //       }
  //     );

  //     // If the user is not found, return null
  //     if (!row) return null;

  //     // Calculate the free passes left
  //     const freePassesLeft = row.freePassesTotal - row.freePassesUsed;
  //     return freePassesLeft;
  //   } catch (err) {
  //     console.error("Error in getFreePasses:", err);
  //     return null;
  //   }
  // }

  // async giveFreePass(telegramId: number): Promise<number | null> {
  //   const telegramIdKey: keyof UserModel = "telegramId";
  //   try {
  //     // Fetch the user from the database
  //     const row = await new Promise<UserModel | undefined>(
  //       (resolve, reject) => {
  //         this._db.get<UserModel>(
  //           `SELECT * FROM users WHERE ${telegramIdKey} = ?`,
  //           [telegramId],
  //           (err, row) => {
  //             if (err) reject(err);
  //             else resolve(row);
  //           }
  //         );
  //       }
  //     );

  //     // If the user is not found, return null
  //     if (!row) return null;

  //     // Update the freePassesTotal
  //     const updatedFreePassesTotal = row.freePassesTotal + 1;

  //     // Perform the update query
  //     await new Promise<void>((resolve, reject) => {
  //       this._db.run(
  //         `UPDATE users SET freePassesTotal = ? WHERE telegramId = ?`,
  //         [updatedFreePassesTotal, telegramId],
  //         (err) => {
  //           if (err) reject(err);
  //           else resolve();
  //         }
  //       );
  //     });

  //     // Free passes left
  //     const freePassesLeft = updatedFreePassesTotal - row.freePassesUsed;
  //     return freePassesLeft;
  //   } catch (err) {
  //     console.error("Error in giveFreePass:", err);
  //     return null;
  //   }
  // }

  /**
   * Update the bump amount for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newBumpAmount - The new bump amount to set.
   * @returns A boolean indicating if the update was successful.
   */
  async updateBumpAmount(
    telegramId: number,
    newBumpAmount: number
  ): Promise<number | null> {
    // Use findOneAndUpdate to find the user and update the bumpAmount and updatedAt fields
    const updatedUser = await UserModelV2.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        bumpAmount: newBumpAmount, // Update the bumpAmount field
      },
      {
        new: true, // Return the updated document, not the old one
      }
    );

    return updatedUser ? updatedUser.bumpAmount : null;
  }

  /**
   * Update the interval value for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newInterval - The new interval to set.
   * @returns A boolean indicating if the update was successful.
   */
  /**
   * Update the interval value for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newInterval - The new interval to set.
   * @returns A number indicating the updated interval value.
   */
  async updateInterval(
    telegramId: number,
    newInterval: number
  ): Promise<number | null> {
    // Use findOneAndUpdate to find the user and update the bumpIntervalInSeconds and updatedAt fields
    const updatedUser = await UserModelV2.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        bumpIntervalInSeconds: newInterval, // Update the bumpIntervalInSeconds field
      },
      {
        new: true, // Return the updated document, not the old one
      }
    );

    // Return the updated bumpIntervalInSeconds
    return updatedUser ? updatedUser.bumpIntervalInSeconds : null;
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
  ): Promise<number | null> {
    // Use findOneAndUpdate to find the user and update the slippage and updatedAt fields
    const updatedUser = await UserModelV2.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        slippage: newSlippage, // Update the slippage field
      },
      {
        new: true, // Return the updated document, not the old one
      }
    );

    // Return the updated slippage
    return updatedUser ? updatedUser.slippage : null;
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
  ): Promise<number | null> {
    // Use findOneAndUpdate to find the user and update the priorityFee and updatedAt fields
    const updatedUser = await UserModelV2.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      { priorityFee: newPriorityFee },
      {
        new: true, // Return the updated document, not the old one
      }
    );

    // Return the updated priorityFee
    return updatedUser ? updatedUser.priorityFee : null;
  }

  async setUpUsersPumpFunAcc(
    telegramId: number,
    privateKey: string
  ): Promise<void> {
    try {
      const pumpFunService = new PumpFunService();
      const authCookie = await pumpFunService.login(privateKey);
      if (!authCookie) return;

      // Generate unique username
      function generateCustomID(alphabet: string, length: number): string {
        let result = "";
        const characters = alphabet.split("");
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters[Math.floor(Math.random() * charactersLength)];
        }
        return result;
      }
      const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const id = generateCustomID(alphabet, 4);
      const newUserName = `${BOT_USERNAME_BASE}_${id}`; // The whole username must be max 10 characters

      // Update profile promise
      let success = false;
      const res = await pumpFunService.updateProfile(
        newUserName,
        BOT_IMAGE_GIF,
        BOT_DESCRIPTION,
        authCookie
      );

      // There's a chance the username is taken, so we'll retry once more
      if (!res) {
        const secondRes = await pumpFunService.updateProfile(
          newUserName,
          BOT_IMAGE_GIF,
          BOT_DESCRIPTION,
          authCookie
        );
        if (!secondRes) {
          throw new Error("Error updating users pump fun account");
        }
      }

      // Update user in db that pump fun account is set
      await UserModelV2.findOneAndUpdate(
        { telegramId },
        { pumpFunAccIsSet: true },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating users pump fun account:", error);
    }
  }

  /**
   * Increment the bumps counter by a specified amount for a user.
   * @param telegramId - The user's Telegram ID.
   * @param bumpAmountToIncrement - The amount to increment the bumps counter.
   * @returns A Promise resolving to the new bumpsCounter value.
   */
  async incrementBumpsCounter(
    telegramId: number,
    bumpAmountToIncrement: number
  ): Promise<number | null> {
    // Use findOneAndUpdate to increment bumpsCounter and update the updatedAt field
    const updatedUser = await UserModelV2.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        $inc: { bumpsCounter: bumpAmountToIncrement }, // Increment bumpsCounter by bumpAmountToIncrement
        updatedAt: new Date().toISOString(), // Update the updatedAt field
      },
      {
        new: true, // Return the updated document, not the old one
      }
    );

    // Return the updated bumpsCounter
    return updatedUser ? updatedUser.bumpsCounter : null;
  }

  private _encryptPrivateKey(privateKey: string) {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  }

  private _decryptPrivateKey(encryptedPrivateKey: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private _docToJSON(userDoc: UserDoc): User {
    const { encryptedPrivateKey, ...userJSON } = userDoc.toJSON() as UserModel;
    const data: User = {
      ...userJSON,
      _id: userDoc._id.toString(),
      privateKey: this._decryptPrivateKey(encryptedPrivateKey),
    };
    return data;
  }
}
