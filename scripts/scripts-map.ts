import { INestApplicationContext } from "@nestjs/common";
import { createPumpFunProfileTask } from "./tasks/create-pump-fun-profile/export-users.task";

export const SCRIPTS_MAP: Record<
  string,
  (appContext: INestApplicationContext) => Promise<void>
> = {
  "export-users": createPumpFunProfileTask,
};
