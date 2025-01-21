import { Scenes } from "telegraf";
import { BumpStatus } from "./start/types";
import { User } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../core/user/types";

export interface BotSessionData extends Scenes.SceneSessionData {
  bumpStatus: BumpStatus;
  user: UserDoc;
}

export interface BotContext
  extends Omit<Scenes.SceneContext, "session" | "from"> {
  from: User;
  session: BotSessionData;
}
