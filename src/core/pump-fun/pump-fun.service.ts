import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { PumpFunProfile, UserUpdateResponse } from "./types";
import axios from "axios";
import { Injectable } from "@nestjs/common";
import { BOT_DESCRIPTION, BOT_IMAGE } from "./constants";

@Injectable()
export class PumpFunService {
  private origin = "https://frontend-api.pump.fun";
  private headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.pump.fun/",
    Origin: "https://www.pump.fun",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };

  async createProfile(keypair: Keypair): Promise<PumpFunProfile> {
    const authCookie = await this.login(keypair);
    const updatedProfile = await this.updateProfile(authCookie, {
      username: this.generateUsername(),
      bio: BOT_DESCRIPTION,
      imageUrl: BOT_IMAGE,
    });
    return updatedProfile;
  }

  private async login(keypair: Keypair): Promise<string> {
    const timestamp = Date.now();
    const message = `Sign in to pump.fun: ${timestamp}`;
    const encodedMessage = new TextEncoder().encode(message);

    const signatureUint8Array = nacl.sign.detached(
      encodedMessage,
      keypair.secretKey
    );
    const signature = bs58.encode(signatureUint8Array);

    const payload = {
      address: keypair.publicKey.toBase58(),
      signature: signature,
      timestamp: timestamp,
    };

    const loginRes = await axios.post(`${this.origin}/auth/login`, payload, {
      headers: this.headers,
    });

    const setCookieHeader = loginRes.headers["set-cookie"];
    if (!setCookieHeader || !setCookieHeader.length) {
      throw new Error("Failed retrieving cookie header");
    }

    return setCookieHeader.join("; ");
  }

  private async updateProfile(
    authCookie: string,
    update: PumpFunProfile
  ): Promise<PumpFunProfile> {
    const updateRes = await axios.post<UserUpdateResponse>(
      `${this.origin}/users`,
      update,
      {
        headers: {
          ...this.headers,
          Cookie: authCookie,
        },
      }
    );

    if ("address" in updateRes.data) {
      return update;
    } else {
      throw updateRes.data;
    }
  }

  private generateUsername(): string {
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
    const id = generateCustomID(alphabet, 3);

    const randomNumber = Math.floor(Math.random() * 10);

    return `ezpump${randomNumber}${id}`; // The whole username must be max 10 characters
  }
}
