import { INestApplicationContext } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";

export async function deleteDuplicateUsersTask(
  appContext: INestApplicationContext
) {
  // Dependencies
  const userService = appContext.get(UserService);

  // Delete duplicate users
  const deleteResponse = await userService.deleteDuplicates();
  console.log("Delete response:", deleteResponse);
}
