import { BOT_DESCRIPTION, BOT_IMAGE } from "../../shared/config";
import { UserDoc } from "./types";
import { CustomResponse } from "../../shared/types";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  // async setUpUsersPumpFunAcc(
  //   telegramId: number,
  //   privateKey: string
  // ): Promise<void> {
  //   try {
  //     const pumpFunService = new PumpFunService();
  //     const authCookie = await pumpFunService.login(privateKey);
  //     if (!authCookie) return;

  //     // Generate unique username
  //     function generateCustomID(alphabet: string, length: number): string {
  //       let result = "";
  //       const characters = alphabet.split("");
  //       const charactersLength = characters.length;
  //       for (let i = 0; i < length; i++) {
  //         result += characters[Math.floor(Math.random() * charactersLength)];
  //       }
  //       return result;
  //     }
  //     const alphabet =
  //       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //     const id = generateCustomID(alphabet, 7);
  //     const randomNumber = Math.floor(Math.random() * 10);
  //     const newUserName = `ez${randomNumber}${id}`; // The whole username must be max 10 characters

  //     // Update profile promise
  //     const res = await pumpFunService.updateProfile(
  //       newUserName,
  //       BOT_IMAGE,
  //       BOT_DESCRIPTION,
  //       authCookie
  //     );

  //     // There's a chance the username is taken, so we'll retry once more
  //     if (!res) {
  //       const secondRes = await pumpFunService.updateProfile(
  //         newUserName,
  //         BOT_IMAGE,
  //         BOT_DESCRIPTION,
  //         authCookie
  //       );
  //       if (!secondRes) {
  //         throw new Error("Error updating users pump fun account");
  //       }
  //     }

  //     // Update user in db that pump fun account is set
  //     await this.userRepo.updateOne(telegramId, { isPumpFunAccountSet: true });
  //   } catch (error) {
  //     console.error("Error updating users pump fun account:", error);
  //   }
  // }

  // async giveServicePass(
  //   telegramId: number,
  //   expirationDate?: string
  // ): Promise<UserDoc | null> {
  //   const servicePass = {
  //     createdAt: new Date().toISOString(),
  //     expirationDate,
  //   };

  //   return this.userRepo.updateOne(telegramId, { servicePass });
  // }

  // async buyTokenPass(
  //   telegramId: number,
  //   payerPrivateKey: string
  // ): Promise<CustomResponse<string>> {
  //   try {
  //     const solanaService = new SolanaService();

  //     // Step 1: Perform the SOL transfer using applyBuyTokenPassTx
  //     const transferResponse = await solanaService.applyBuyTokenPassTx(
  //       payerPrivateKey
  //     );

  //     if (!transferResponse.success) {
  //       console.error("Error during SOL transfer:", transferResponse.error);
  //       return {
  //         success: false,
  //         code: "TRANSACTION_FAILED",
  //         error: transferResponse.error,
  //       };
  //     }

  //     // Step 2: Use giveTokenPass to update the user's token passes
  //     const giftResponse = await this.userRepo.increment(
  //       telegramId,
  //       "totalTokenPasses"
  //     );

  //     if (!giftResponse.success) {
  //       console.error(
  //         "SOL transfer succeeded, but updating token passes failed.",
  //         giftResponse.error
  //       );
  //       return giftResponse;
  //     }

  //     // Step 3: Return success response with the transaction signature
  //     return {
  //       success: true,
  //       data: transferResponse.data, // Transaction signature
  //     };
  //   } catch (error) {
  //     console.error("Error in buyTokenPass:", error);
  //     return {
  //       success: false,
  //       code: "UNKNOWN_ERROR",
  //       error,
  //     };
  //   }
  // }

  // async useTokenPass(
  //   telegramId: number,
  //   ca: string
  // ): Promise<CustomResponse<null>> {
  //   const user = await this.userRepo.find(telegramId);

  //   if (!user) {
  //     throw { code: 404 };
  //   }

  //   const remainingTokenPasses =
  //     user.totalTokenPasses - user.usedTokenPasses.size;

  //   if (remainingTokenPasses <= 0) {
  //     return {
  //       success: false,
  //       code: "INSUFFICIENT_BALANCE",
  //       error: "The user does not have any token passes left.",
  //     };
  //   }

  //   if (user.usedTokenPasses.get(ca)) {
  //     return {
  //       success: false,
  //       code: "DUPLICATE_IDENTIFIER",
  //       error: `A token pass already exists with the identifier: ${ca}`,
  //     };
  //   }

  //   user.usedTokenPasses.set(ca, {
  //     createdAt: new Date().toISOString(), // Current time in ISO string format
  //   });

  //   // Save the updated user document
  //   await this.userRepo.updateOne(telegramId, {
  //     usedTokenPasses: user.usedTokenPasses,
  //   });

  //   return {
  //     success: true,
  //     data: null,
  //   };
  // }

  // /** Implement a method for newsLetter `updateUsersWhoBannedBot` */
}
