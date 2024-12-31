import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../../constants";

export function encryptPrivateKey(privateKey: string) {
  return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
}

export function decryptPrivateKey(encryptedPrivateKey: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
