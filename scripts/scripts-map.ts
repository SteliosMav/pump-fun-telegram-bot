import { INestApplicationContext } from "@nestjs/common";
import { createPumpFunProfileTask } from "./tasks/create-pump-fun-profile/create-pump-fun-profile";

export const SCRIPTS_MAP: Record<
  string,
  (appContext: INestApplicationContext) => Promise<void>
> = {
  "create-pump-fun-profile": createPumpFunProfileTask,
};
