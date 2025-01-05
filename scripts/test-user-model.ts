import connectDB from "../src/lib/mongo";
import { UserModel } from "../src/user/user-model";

connectDB();

(async () => {
  // const user = new UserModel({
  //   telegramId: 1,
  //   encryptedPrivateKey:
  //     "U2FsdGVkX1/wxcCnZeirjjQvuGqa37ezNlcrle+8RQPsSyeaj+HCfBxlj9ttlzbmcbT3SP8AICg4LpTkXwNnmem2SZMKGoAr3IdttyupD+eZlN5UXs+meEpMRzpnWWu561GNavBuKqMHuroJFa26GA==",
  //   firstName: "John",
  //   isBot: false,
  // });
  // await user.save();

  // const user = await UserModel.increaseTotalBumps(1, 3);

  const user = await UserModel.updateBumpSettings(1, { amount: 0.05 });

  console.log(user);

  process.exit();
})();
