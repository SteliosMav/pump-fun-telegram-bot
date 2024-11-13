import { Keypair } from "@solana/web3.js";
import { PUMP_FUN_API } from "../constants";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { CoinData } from "./types";

export enum TransactionMode {
  Simulation,
  Execution,
}

export class PumpFunService {
  private _baseUrl = PUMP_FUN_API;
  private _pumpFunHeaders = {
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

  constructor() {}

  async getCoinData(mintStr: string): Promise<CoinData | null> {
    console.log("Mint String: ", mintStr);
    const url = `${this._baseUrl}/coins/${mintStr}`;

    try {
      const response = await fetch(url, { headers: this._pumpFunHeaders });

      if (response.ok) {
        return await response.json();
      } else {
        console.error("Failed to retrieve coin data:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return null;
    }
  }

  async login(privateKey: string): Promise<string | null> {
    // Step 1: Initialize keypair from the private key
    const secretKey = bs58.decode(privateKey); // Decode the base58 private key
    const keypair = Keypair.fromSecretKey(secretKey);

    // Step 2: Generate a timestamp and create the sign-in message
    const timestamp = Date.now();
    const message = `Sign in to pump.fun: ${timestamp}`;
    const encodedMessage = new TextEncoder().encode(message);

    // Step 3: Sign the message using tweetnacl
    const signatureUint8Array = nacl.sign.detached(
      encodedMessage,
      keypair.secretKey
    );
    const signature = bs58.encode(signatureUint8Array); // Encode signature in base58

    // Step 4: Prepare the payload
    const payload = {
      address: keypair.publicKey.toBase58(),
      signature: signature,
      timestamp: timestamp,
    };

    // Step 5: Send the login request using fetch
    try {
      const response = await fetch(`${this._baseUrl}/auth/login`, {
        method: "POST",
        headers: this._pumpFunHeaders,
        body: JSON.stringify(payload),
      });

      // Get set-cookie header from response
      const setCookieHeader = response.headers.get("set-cookie");
      const data = await response.json();
      console.log(`Login ${response.ok ? "Succeeded" : "Failed"}:`, data);
      console.log("Set-Cookie Header:", setCookieHeader);
      return setCookieHeader;
    } catch (error) {
      console.error("Error during login:", error);
      return null;
    }
  }

  async updateProfile(
    username: string,
    imageUrl: string,
    bio: string,
    authCookie: string
  ) {
    // Step 1: Prepare the payload with the user profile data
    const payload = {
      username,
      bio,
      profileImage: imageUrl,
    };

    // Step 2: Send the profile update request using fetch
    try {
      const response = await fetch(`${this._baseUrl}/users`, {
        method: "POST",
        headers: {
          ...this._pumpFunHeaders,
          Cookie: authCookie,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile update successful:", data);
      } else {
        console.error("Profile update failed:", await response.json());
      }
    } catch (error) {
      console.error("Error during profile update:", error);
    }
  }
}
