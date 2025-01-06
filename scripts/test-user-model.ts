import connectDB from "../src/lib/mongo";
import { UserModel } from "../src/user/user-model";
import { UserRepository } from "../src/user/user.repository";

const userRepo = new UserRepository();

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

  // const user = await UserModel.updateBumpSettings(1, { amount: 0.05 });

  // const user = await userRepo.create({
  //   telegramId: 3,
  //   encryptedPrivateKey:
  //     "U2FsdGVkX1/wxcCnZeirjjQvuGqa37ezNlcrle+8RQPsSyeaj+HCfBxlj9ttlzbmcbT3SP8AICg4LpTkXwNnmem2SZMKGoAr3IdttyupD+eZlN5UXs+meEpMRzpnWWu561GNavBuKqMHuroJFa26GA==",
  //   firstName: "Steve",
  //   isBot: false,
  // });

  // const user = await userRepo.find([3]);

  // const user = await userRepo.updateMany([3], { isBot: true });

  const user = await userRepo.increment(1, "isBot" as any, 2);

  // const user = await userRepo.updateOne(1, {
  //   bumpSettings: {
  //     limit: 2,
  //   },
  // });

  // const user = await userRepo.updateOne(1, {
  //   bumpSettings: {},
  // });

  // const user = await UserModel.findOneAndUpdate(
  //   {
  //     telegramId: 1,
  //   },
  //   { $set: { "bumpSettings.intervalInSeconds": 1 } },
  //   { new: true, runValidators: true }
  // );

  console.log(user);

  process.exit();
})();
