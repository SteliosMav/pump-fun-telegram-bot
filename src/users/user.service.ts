import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "src/constants";

export class UserService {
  encryptPrivateKey(privateKey: string) {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  }

  //   async createAndStoreNewAccount(telegramId) {
  //     const newAccountKeypair = Keypair.generate();
  //     const publicKey = newAccountKeypair.publicKey.toBase58();
  //     const privateKey = Buffer.from(newAccountKeypair.secretKey).toString(
  //       "base58"
  //     );

  //     // Encrypt the private key
  //     const encryptedPrivateKey = encryptPrivateKey(privateKey);

  //     // Store in SQLite
  //     const stmt = db.prepare(
  //       "INSERT OR REPLACE INTO users (telegramId, publicKey, encryptedPrivateKey) VALUES (?, ?, ?)"
  //     );
  //     stmt.run(telegramId, publicKey, encryptedPrivateKey);

  //     return publicKey; // Return public key to provide to the user
  //   }

  decryptPrivateKey(encryptedPrivateKey: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  //   async getPrivateKey(telegramId) {
  //     const stmt = db.prepare(
  //       "SELECT encryptedPrivateKey FROM users WHERE telegramId = ?"
  //     );
  //     const row = stmt.get(telegramId);

  //     if (row) {
  //       return decryptPrivateKey(row.encryptedPrivateKey);
  //     } else {
  //       throw new Error("User not found");
  //     }
  //   }
}
