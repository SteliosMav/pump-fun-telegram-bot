import connectDB from "../src/lib/mongo";
import { UserModel } from "../src/user/user-model";
import { UserRepository } from "../src/user/user.repository";

const userRepo = new UserRepository();

connectDB();

(async () => {
  // const user = await userRepo.create({
  //   telegramId: 8,
  //   encryptedPrivateKey:
  //     "U2FsdGVkX1/wxcCnZeirjjQvuGqa37ezNlcrle+8RQPsSyeaj+HCfBxlj9ttlzbmcbT3SP8AICg4LpTkXwNnmem2SZMKGoAr3IdttyupD+eZlN5UXs+meEpMRzpnWWu561GNavBuKqMHuroJFa26GA==",
  //   firstName: "Jacobs2",
  //   isBot: false,
  // });

  const tokenMint = "Cxtna7tPubvtTUZZ97FS4XYHHxUDpJhEP2ADSDZ4pump";

  // const today = new Date();
  // const oneDayAgo = new Date(today);
  // oneDayAgo.setDate(today.getDate() - 1);
  // const user = await userRepo.addServicePass(8, oneDayAgo);

  // const user = await userRepo.addUsedTokenPass(8, tokenMint);

  const user = await userRepo.incrementBumps(8, 4, { tokenPass: tokenMint });

  console.log(user);

  process.exit();
})();
