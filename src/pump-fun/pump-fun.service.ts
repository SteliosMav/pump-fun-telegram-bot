import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { PumpFunProfile, UserUpdateResponse } from "./types";
import axios from "axios";

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

  constructor() {}

  async login(keypair: Keypair): Promise<string> {
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

  async updateProfile(
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

    const f = updateRes.data;
    if ("address" in updateRes.data) {
      return update;
    } else {
      throw updateRes.data;
    }
  }
}
