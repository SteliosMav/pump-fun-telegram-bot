import { UserModel } from "../src/user/user-model";

(async () => {
  // Usage Example
  const user = new UserModel({
    telegramId: 2,
    firstName: "John",
    isBot: false,
    encryptedPrivateKey: "private-key",
  });

  // user.bumpSettings.intervalInSeconds = 0.5;

  console.log("User:", user);

  for (const [key, value] of Object.entries(
    user.validateSync()?.errors || {}
  )) {
    console.log(key, value);
  }
})();
