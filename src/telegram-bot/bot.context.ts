import { Scenes } from "telegraf";
import { BumpStatus } from "./start/types";
import { Chat, User } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../core/user/types";

export interface BotSessionData {
  bumpStatus: BumpStatus;
  user: UserDoc;
  expiresAt: Date;
}

export interface BotContext
  extends Omit<Scenes.SceneContext, "session" | "from"> {
  from: User;
  chat: Chat;
  session: BotSessionData;
}
