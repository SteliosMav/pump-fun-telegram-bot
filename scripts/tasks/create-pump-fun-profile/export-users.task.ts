import { INestApplicationContext } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";

export async function createPumpFunProfileTask(
  appContext: INestApplicationContext
) {
  console.log("Exporting users...");
  console.log("UserService:", appContext.get(UserService));
}
