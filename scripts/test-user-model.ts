import dotenv from "dotenv";
dotenv.config();
import connectDB from "../src/lib/mongo";
import { UserModel } from "../src/user/user.model";
import { UserRepository } from "../src/user/user.repository";

const userRepo = new UserRepository();

connectDB();

(async () => {
  const payload = {
    encryptedPrivateKey:
      "U2FsdGVkX1/wxcCnZeirjjQvuGqa37ezNlcrle+8RQPsSyeaj+HCfBxlj9ttlzbmcbT3SP8AICg4LpTkXwNnmem2SZMKGoAr3IdttyupD+eZlN5UXs+meEpMRzpnWWu561GNavBuKqMHuroJFa26GA==",
    telegram: {
      id: 10,
      firstName: "Jacobs2",
      isBot: false,
    },
  };
  const user = await userRepo.create(payload);

  const tokenMint = "Cxtna7tPubvtTUZZ97FS4XYHHxUDpJhEP2ADSDZ4pump";

  // const today = new Date();
  // const oneDayAgo = new Date(today);
  // oneDayAgo.setDate(today.getDate() - 1);
  // const user = await userRepo.addServicePass(8, oneDayAgo);

  // const user = await userRepo.addUsedTokenPass(8, tokenMint);

  // const user = await userRepo.incrementBumps(8, 4, { tokenPass: tokenMint });

  // const user = await userRepo.updateBumpSettings(9, { limit: 3 });

  console.log(user);

  process.exit();
})();
