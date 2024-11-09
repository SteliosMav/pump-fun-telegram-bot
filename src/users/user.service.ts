import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "src/constants";
import { User } from "./types";
import { Database } from "sqlite3";

export class UserService {
  constructor(private db: Database) {}

  create(user: User): any {
    // Calculate the current date once in ISO format
    const IsoDate = new Date().toISOString();

    // Encrypt the private key
    const encryptedPrivateKey = this._encryptPrivateKey(user.privateKey);

    // SQLite command to insert user with encrypted private key and single IsoDate
    let error = null;
    this.db.run(
      `INSERT INTO users (
          telegramId, encryptedPrivateKey, firstName, isBot, pumpsCounter, createdAt, updatedAt, lastName, username
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.telegramId,
        encryptedPrivateKey,
        user.firstName,
        user.isBot ? 1 : 0, // SQLite boolean workaround
        user.pumpsCounter,
        IsoDate, // `createdAt` uses calculated IsoDate
        IsoDate, // `updatedAt` also uses the same IsoDate
        user.lastName,
        user.username,
      ],
      (err) => {
        console.log("Create response: ", err);
        error = err;
      }
    );

    const newUser = {
      ...user,
      createdAt: IsoDate,
      updatedAt: IsoDate,
    };

    return error ? error : newUser;
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

  private _encryptPrivateKey(privateKey: string) {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  }

  private _decryptPrivateKey(encryptedPrivateKey: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
