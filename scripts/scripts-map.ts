import { INestApplicationContext } from "@nestjs/common";
import { sendNewsLetterTask } from "./tasks/send-news-letter/send-new-letter";
import { giveUsersServicePassTask } from "./tasks/give-users-service-pass/give-users-service-pass";
import { createPumpFunProfileTask } from "./tasks/create-pump-fun-profile/create-pump-fun-profile";
import { updatePumpFunProfilesTask } from "./tasks/update-pump-fun-profiles/update-pump-fun-profiles";
import { deleteDuplicateUsersTask } from "./tasks/delete-duplicate-users/delete-duplicate-users";

export const SCRIPTS_MAP: Record<
  string,
  (appContext: INestApplicationContext) => Promise<void>
> = {
  "create-pump-fun-profile": createPumpFunProfileTask,
  "send-news-letter": sendNewsLetterTask,
  "give-users-service-pass": giveUsersServicePassTask,
  "update-pump-fun-profiles": updatePumpFunProfilesTask,
  "delete-duplicate-users": deleteDuplicateUsersTask,
};
