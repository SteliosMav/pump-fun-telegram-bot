import connectDB from "../src/lib/mongo";
import { UserModel } from "../src/user/user-model";

// MongoDB connection
connectDB();

(async () => {
  // Usage Example
  const user = new UserModel({
    telegramId: 1,
    firstName: "John",
    isBot: false,
    encryptedPrivateKey:
      "U2FsdGVkX1/LqZ1AY+5N5vwGfmJOF65q7INTZC6vB8m60eMe1PLF+gDYWirb9utnpFsAmqRk035HWbo6w1Or4NqSwn/U8X+qsdco4/PsmzZuajk919C8vFZRUZ31gSt7QsxBKWmpDOyoumjAeH+1yQ==",
    // bumpSettings: {
    // },
    tokenPass: new Map([["test", { createdAt: "2021-09-01" }]]),
  });
  user.bumpSettings; // user.bumpSettings.intervalInSeconds = 0.5;
  // console.log("User:", user.tokenPass.has("test"));

  // for (const [key, value] of Object.entries(
  //   user.validateSync()?.errors || {}
  // )) {
  //   console.log(key, value);
  // }

  // const res = await user.save();
  // console.log("User saved:", res);

  process.exit();
})();
