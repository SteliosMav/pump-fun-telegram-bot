import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../constants";
import { BOT_DESCRIPTION, BOT_IMAGE } from "../config";
import { UserDoc } from "./types";
import { UserModel } from "./user-model";
import { PumpFunService } from "../pump-fun/pump-fun.service";
import { CustomResponse } from "../shared/types";
import { SolanaService } from "../solana/solana.service";
import { UserRepository } from "./user.repository";

export class UserService {
  constructor(private userRepo: UserRepository) {}

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
      await this.userRepo.updateOne(telegramId, { isPumpFunAccountSet: true });
    } catch (error) {
      console.error("Error updating users pump fun account:", error);
    }
  }

  async giveServicePass(
    telegramId: number,
    expirationDate?: string
  ): Promise<UserDoc | null> {
    const servicePass = {
      createdAt: new Date().toISOString(),
      expirationDate,
    };

    return this.userRepo.updateOne(telegramId, { servicePass });
  }

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
      const giftResponse = await this.userRepo.increment(
        telegramId,
        "totalTokenPasses"
      );

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

  async useTokenPass(tgId: number, ca: string): Promise<CustomResponse<null>> {
    const user = await this.userRepo.find(tgId);

    if (!user) {
      throw { code: 404 };
    }

    const remainingTokenPasses =
      user.totalTokenPasses - user.usedTokenPasses.size;

    if (remainingTokenPasses <= 0) {
      return {
        success: false,
        code: "INSUFFICIENT_BALANCE",
        error: "The user does not have any token passes left.",
      };
    }

    if (user.usedTokenPasses.get(ca)) {
      return {
        success: false,
        code: "DUPLICATE_IDENTIFIER",
        error: `A token pass already exists with the identifier: ${ca}`,
      };
    }

    user.usedTokenPasses.set(ca, {
      createdAt: new Date().toISOString(), // Current time in ISO string format
    });

    // Save the updated user document
    await user.save();

    return {
      success: true,
      data: null,
    };
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

  private _docToJSON(userDoc: any): UserDoc {
    const { encryptedPrivateKey, ...userJSON } = userDoc.toJSON();
    const data: UserDoc = {
      ...userJSON,
      _id: userDoc._id.toString(),
      privateKey: this._decryptPrivateKey(encryptedPrivateKey),
    };
    return data;
  }
}
