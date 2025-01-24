import { Scenes } from "telegraf";
import { BumpStatus } from "./home/types";
import {
  Chat,
  Message,
  Update,
  User,
} from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../core/user/types";

export interface BotSessionData {
  bumpStatus: BumpStatus;
  user: UserDoc;
  expiresAt: Date;
}

interface TextMessage extends Message.TextMessage {
  text: string;
}

export interface BotContext extends Omit<Scenes.SceneContext, "session"> {
  from: User;
  chat: Chat;
  session: BotSessionData;
  message: Update.New & (Update.NonChannel & TextMessage);
}
