import { Scenes } from "telegraf";
import {
  Chat,
  Message,
  Update,
  User,
} from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../core/user/types";
import { BumpingState } from "./shared/classes/bumping-state";

export interface BotSessionData {
  bumpingState: BumpingState;
  user: UserDoc;
  expiresAt: Date;
  botLastMessageId: number | null;
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
