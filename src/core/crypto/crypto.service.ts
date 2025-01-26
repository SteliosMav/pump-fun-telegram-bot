import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import CryptoJS from "crypto-js";
import { Configuration } from "../../shared/config";

@Injectable()
export class CryptoService {
  private readonly encryptionKey: string;

  constructor(
    private readonly configService: ConfigService<Configuration, true>
  ) {
    this.encryptionKey = this.configService.get("ENCRYPTION_KEY")!;
  }

  encryptPrivateKey(privateKey: string): string {
    return CryptoJS.AES.encrypt(privateKey, this.encryptionKey).toString();
  }

  decryptPrivateKey(encryptedPrivateKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
