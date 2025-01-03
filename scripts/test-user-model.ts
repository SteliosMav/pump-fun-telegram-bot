import { UserModel } from "../src/user/user-model";

(async () => {
  // Usage Example
  const user = new UserModel({
    telegramId: 2,
    firstName: "John",
    isBot: false,
    encryptedPrivateKey:
      "U2FsdGVkX1/LqZ1AY+5N5vwGfmJOF65q7INTZC6vB8m60eMe1PLF+gDYWirb9utnpFsAmqRk035HWbo6w1Or4NqSwn/U8X+qsdco4/PsmzZuajk919C8vFZRUZ31gSt7QsxBKWmpDOyoumjAeH+1yQ==",
  });

  // user.bumpSettings.intervalInSeconds = 0.5;

  console.log("User:", user.getPrivateKey());

  for (const [key, value] of Object.entries(
    user.validateSync()?.errors || {}
  )) {
    console.log(key, value);
  }
})();
