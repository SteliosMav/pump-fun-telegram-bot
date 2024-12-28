import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../constants";
import { BOT_DESCRIPTION, BOT_IMAGE } from "../config";
import { User } from "./types";
import { IUserModel, UserDoc, UserModel } from "./user-model";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import { CustomResponse } from "../shared/types";
import { SolanaService } from "../solana/solana.service";
import TelegramBot from "node-telegram-bot-api";

export class UserService {
  constructor() {}

  async create(user: Omit<User, "_id">): Promise<User> {
    // Encrypt the private key
    const encryptedPrivateKey = this._encryptPrivateKey(user.privateKey);

    const newUser: Omit<IUserModel, "_id"> = {
      telegramId: user.telegramId,
      encryptedPrivateKey,
      firstName: user.firstName,
      isBot: user.isBot,
      bumpsCounter: user.bumpsCounter,
      tokenPassesTotal: user.tokenPassesTotal,
      tokenPassesUsed: user.tokenPassesUsed,
      bumpIntervalInSeconds: user.bumpIntervalInSeconds,
      pumpFunAccIsSet: user.pumpFunAccIsSet,
      bumpAmount: user.bumpAmount,
      bumpsLimit: user.bumpsLimit,
      slippage: user.slippage,
      priorityFee: user.priorityFee,
      tokenPass: user.tokenPass,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastName: user.lastName,
      username: user.username,
    };
    const toSave: UserDoc = new UserModel(newUser);

    const userDoc = await toSave.save();
    return this._docToJSON(userDoc);
  }

  async getUser(telegramId: number): Promise<User | null> {
    const userDoc = await UserModel.findOne({
      telegramId: telegramId,
    });
    return userDoc ? this._docToJSON(userDoc) : null;
  }

  async getUsers(telegramIds?: number[]): Promise<User[]> {
    const query = telegramIds ? { telegramId: { $in: telegramIds } } : {};
    const userDocs = await UserModel.find(query);
    return userDocs.map((doc) => this._docToJSON(doc));
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
  ): Promise<number | null> {
    // Use findOneAndUpdate to find the user and update the bumpAmount
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        bumpAmount: newBumpAmount, // Update the bumpAmount field
      },
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
      }
    );

    return updatedUser ? updatedUser.bumpAmount : null;
  }

  /**
   * Update the bumps limit for a user.
   * @param telegramId - The user's Telegram ID.
   * @param newBumpsLimit - The new bumps limit to set.
   * @returns A boolean indicating if the update was successful.
   */
  async updateBumpsLimit(
    telegramId: number,
    newBumpsLimit: number
  ): Promise<number | null> {
    // Use findOneAndUpdate to find the user and update the bumpsLimit
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        bumpsLimit: newBumpsLimit, // Update the bumpsLimit field
      },
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
      }
    );

    return updatedUser ? updatedUser.bumpsLimit : null;
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
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        bumpIntervalInSeconds: newInterval, // Update the bumpIntervalInSeconds field
      },
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
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
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        slippage: newSlippage, // Update the slippage field
      },
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
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
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      { priorityFee: newPriorityFee },
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
      }
    );

    // Return the updated priorityFee
    return updatedUser ? updatedUser.priorityFee : null;
  }

  /**
   * Update telegram info for a user.
   * @param telegramId - The user's Telegram ID.
   * @param from - Telegram from user.
   * @returns A boolean indicating if the update was successful.
   */
  async updateTgInfo(
    telegramId: number,
    from: TelegramBot.Message["from"]
  ): Promise<boolean> {
    const valuesToUpdate: any = {};
    if (from?.first_name) valuesToUpdate.firstName = from.first_name;
    if (from?.last_name) valuesToUpdate.lastName = from.last_name;
    if (from?.username) valuesToUpdate.username = from.username;
    // Use findOneAndUpdate to find the user and update the tg-Info and updatedAt fields
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      valuesToUpdate,
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
      }
    );

    // Return the updated priorityFee
    return updatedUser ? true : false;
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
      const id = generateCustomID(alphabet, 7);
      const randomNumber = Math.floor(Math.random() * 10);
      const newUserName = `ez${randomNumber}${id}`; // The whole username must be max 10 characters

      // Update profile promise
      const res = await pumpFunService.updateProfile(
        newUserName,
        BOT_IMAGE,
        BOT_DESCRIPTION,
        authCookie
      );

      // There's a chance the username is taken, so we'll retry once more
      if (!res) {
        const secondRes = await pumpFunService.updateProfile(
          newUserName,
          BOT_IMAGE,
          BOT_DESCRIPTION,
          authCookie
        );
        if (!secondRes) {
          throw new Error("Error updating users pump fun account");
        }
      }

      // Update user in db that pump fun account is set
      await UserModel.findOneAndUpdate(
        { telegramId },
        { pumpFunAccIsSet: true },
        { new: true, runValidators: true }
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
    const updatedUser = await UserModel.findOneAndUpdate(
      { telegramId }, // Query to find the user by telegramId
      {
        $inc: { bumpsCounter: bumpAmountToIncrement }, // Increment bumpsCounter by bumpAmountToIncrement
        lastBumpAt: new Date().toISOString(), // Update the lastBumpAt field
      },
      {
        new: true, // Return the updated document, not the old one
        runValidators: true, // Validate the new value against the schema
      }
    );

    // Return the updated bumpsCounter
    return updatedUser ? updatedUser.bumpsCounter : null;
  }

  /**
   * Assign a service fee pass to a user with an optional expiration date.
   * @param telegramId - The user's Telegram ID.
   * @param expirationDate - The optional expiration date for the pass (ISO 8601 format).
   * @returns A Promise resolving to the updated user.
   */
  async giveServiceFeePass(
    telegramId: number,
    expirationDate?: string
  ): Promise<User | null> {
    try {
      // Prepare the service fee pass object
      const serviceFeePass: User["serviceFeePass"] = {
        createdAt: new Date().toISOString(), // Set the current date as createdAt
      };
      // Set expirationDate if provided, otherwise undefined
      if (expirationDate) serviceFeePass.expirationDate = expirationDate;

      // Update the user's serviceFeePass
      const updatedUser = await UserModel.findOneAndUpdate(
        { telegramId }, // Query to find the user by telegramId
        {
          $set: { serviceFeePass }, // Set the serviceFeePass field
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Validate the new value against the schema
        }
      );

      // Return the updated user
      return updatedUser ? this._docToJSON(updatedUser) : null;
    } catch (error) {
      console.error("Error assigning service fee pass:", error);
      return null;
    }
  }

  /**
   * Gifts a token pass to a user by updating their tokenPassesTotal.
   * @param telegramId The Telegram ID of the user.
   * @returns A response indicating the success or failure of the operation.
   */
  async giveTokenPass(telegramId: number): Promise<CustomResponse<string>> {
    try {
      // Update the tokenPassesTotal for the user
      const updatedUser = await UserModel.findOneAndUpdate(
        { telegramId }, // Query to find the user by Telegram ID
        { $inc: { tokenPassesTotal: 1 } }, // Increment tokenPassesTotal by 1
        { new: true, runValidators: true } // Return the updated user and validate schema
      );

      if (!updatedUser) {
        console.error(
          "User was not found in the database to be updated",
          telegramId
        );
        return {
          success: false,
          code: "USER_NOT_FOUND",
          error: "User not found",
        };
      }

      // Return success response
      return {
        success: true,
        data: "Token pass successfully given to the user.",
      };
    } catch (error) {
      console.error("Error in giveTokenPass:", error);
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        error,
      };
    }
  }

  /**
   * Buys a token pass for the user, performing a SOL transfer and updating their tokenPassesTotal.
   * @param telegramId The Telegram ID of the user.
   * @param payerPrivateKey The private key of the payer as a base58 string.
   * @returns A response indicating the success or failure of the operation.
   */
  async buyTokenPass(
    telegramId: number,
    payerPrivateKey: string
  ): Promise<CustomResponse<string>> {
    try {
      const solanaService = new SolanaService();

      // Step 1: Perform the SOL transfer using applyBuyTokenPassTx
      const transferResponse = await solanaService.applyBuyTokenPassTx(
        payerPrivateKey
      );

      if (!transferResponse.success) {
        console.error("Error during SOL transfer:", transferResponse.error);
        return {
          success: false,
          code: "TRANSACTION_FAILED",
          error: transferResponse.error,
        };
      }

      // Step 2: Use giveTokenPass to update the user's token passes
      const giftResponse = await this.giveTokenPass(telegramId);

      if (!giftResponse.success) {
        console.error(
          "SOL transfer succeeded, but updating token passes failed.",
          giftResponse.error
        );
        return giftResponse;
      }

      // Step 3: Return success response with the transaction signature
      return {
        success: true,
        data: transferResponse.data, // Transaction signature
      };
    } catch (error) {
      console.error("Error in buyTokenPass:", error);
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        error,
      };
    }
  }

  /**
   * Use a token pass for the specified user.
   * @param tgId - The Telegram ID of the user.
   * @param ca - The identifier for the token pass usage.
   * @returns A CustomResponse indicating success or failure.
   */
  async useTokenPass(tgId: number, ca: string): Promise<CustomResponse<null>> {
    try {
      // Fetch the user from the database
      const user = await UserModel.findOne({ telegramId: tgId });

      if (!user) {
        return {
          success: false,
          code: "USER_NOT_FOUND",
        };
      }

      // Calculate the remaining token passes
      const remainingTokenPasses = user.tokenPassesTotal - user.tokenPassesUsed;

      if (remainingTokenPasses <= 0) {
        return {
          success: false,
          code: "INSUFFICIENT_BALANCE",
          error: "The user does not have any token passes left.",
        };
      }

      // Check if the token pass already exists
      if (user.tokenPass.ca) {
        return {
          success: false,
          code: "DUPLICATE_IDENTIFIER",
          error: `A token pass already exists with the identifier: ${ca}`,
        };
      }

      // Add the new token pass entry
      (user.tokenPass as any).set(ca, {
        createdAt: new Date().toISOString(), // Current time in ISO string format
      });

      // Increment the tokens used
      user.tokenPassesUsed += 1;

      // Save the updated user document
      await user.save();

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error("Error in useTokenPass:", error);
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        error: error,
      };
    }
  }

  async getAllUserIds(): Promise<number[]> {
    // Fetch all users from the database
    const users = await this.getUsers();

    // Extract and return an array of telegram IDs
    return users.map((user) => user.telegramId);
  }

  private _encryptPrivateKey(privateKey: string) {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  }

  private _decryptPrivateKey(encryptedPrivateKey: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private _docToJSON(userDoc: UserDoc): User {
    const { encryptedPrivateKey, ...userJSON } = userDoc.toJSON() as IUserModel;
    const data: User = {
      ...userJSON,
      _id: userDoc._id.toString(),
      privateKey: this._decryptPrivateKey(encryptedPrivateKey),
    };
    return data;
  }
}
