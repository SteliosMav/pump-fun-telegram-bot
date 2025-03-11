import { INestApplicationContext } from "@nestjs/common";
import { exportUsersTask } from "./tasks/export-users.task";

export const SCRIPTS_MAP: Record<
  string,
  (appContext: INestApplicationContext) => Promise<void>
> = {
  "export-users": exportUsersTask,
};
