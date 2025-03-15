import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import {
  CreatePumpFunUserPayload,
  CreatePumpFunUserResponse,
  UpdatePumpFunProfilePayload,
  UserUpdateResponse,
} from "./types";
import axios, { AxiosRequestConfig } from "axios";
import { Injectable } from "@nestjs/common";
import { BOT_DESCRIPTION } from "./constants";
import * as fs from "fs";
import FormData from "form-data";
import { generateUsername } from "./pump-fun-utils";

@Injectable()
export class PumpFunService {
  /**
   * Creates a profile on Pump.fun using the provided keypair.
   * @param keypair - The keypair to use for authentication.
   * @returns The API response containing the created user details.
   */
  async createProfile(keypair: Keypair): Promise<CreatePumpFunUserResponse> {
    // Authenticate with pump.fun
    const authCookie = await this.login(keypair);

    // Upload image
    const profileImage = await this.uploadImageToPumpFun(
      authCookie,
      keypair.publicKey.toBase58()
    );

    // Create user
    return this.createUser(authCookie, {
      profileImage,
      username: generateUsername(),
      bio: BOT_DESCRIPTION,
    });
  }

  /**
   * Logs into Pump.fun using the provided keypair. No registration is required.
   * The user's keypair is sufficient for authentication even if it hasn't been used.
   * @param keypair - The keypair to use for authentication.
   * @returns The authentication string to be set as cookie (required for subsequent requests).
   */
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

    const loginRes = await axios.post(
      `https://frontend-api.pump.fun/auth/login`,
      payload,
      {
        headers: {
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
        },
      }
    );

    const setCookieHeader = loginRes.headers["set-cookie"];
    if (!setCookieHeader || !setCookieHeader.length) {
      throw new Error("Failed retrieving cookie header");
    }

    return setCookieHeader.join("; ");
  }

  /**
   * Uploads an image to Pump.fun's IPFS API.
   * @param authCookie - The authentication cookie for authorization.
   * @returns The IPFS URI of the uploaded image.
   */
  private async uploadImageToPumpFun(
    authCookie: string,
    address: string
  ): Promise<string> {
    const url = "https://pump.fun/api/ipfs-file";

    // Prepare headers
    const headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      origin: "https://pump.fun",
      referer: `https://pump.fun/profile/${address}`,
      "sec-ch-ua":
        '"Google Chrome";v="134", "Chromium";v="134", "Not:A-Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      cookie: authCookie,
    };

    // Create form-data with the image file
    const formData = new FormData();
    const filePath = "./images/user-profile-image.gif";
    formData.append("file", fs.createReadStream(filePath));

    // Merge form-data headers with custom headers
    const combinedHeaders = {
      ...headers,
      ...formData.getHeaders(),
    };

    // Send the POST request
    const response = await axios.post<{ fileUri: string }>(url, formData, {
      headers: combinedHeaders,
    });
    return response.data.fileUri;
  }

  /**
   * Creates a user on Pump.fun
   * @param authCookie - The authentication cookie
   * @param payload - The user creation payload
   * @returns The API response containing the created user details
   */
  private async createUser(
    authCookie: string,
    payload: CreatePumpFunUserPayload
  ): Promise<CreatePumpFunUserResponse> {
    const url = "https://frontend-api-v3.pump.fun/users";

    // Headers
    const headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,el;q=0.7",
      "content-type": "application/json",
      origin: "https://pump.fun",
      priority: "u=1, i",
      referer: "https://pump.fun/",
      "sec-ch-ua":
        '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      cookie: authCookie,
    };

    const config: AxiosRequestConfig = {
      method: "POST",
      url,
      headers,
      data: payload,
    };

    const response = await axios(config);
    if ("error" in response.data) {
      throw new Error(response.data.error);
    } else {
      return response.data;
    }
  }

  /**
   * @deprecated This method has been replaced by the `createUser` method.
   */
  private async updateProfile(
    authCookie: string,
    update: UpdatePumpFunProfilePayload
  ): Promise<UpdatePumpFunProfilePayload> {
    const updateRes = await axios.post<UserUpdateResponse>(
      `https://frontend-api.pump.fun/users`,
      update,
      {
        headers: {
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
}
