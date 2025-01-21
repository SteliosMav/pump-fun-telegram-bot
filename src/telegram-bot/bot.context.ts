import { Scenes } from "telegraf";
import { BumpStatus } from "./start/types";

export interface BotSessionData extends Scenes.SceneSessionData {
  updatedAt: string;
  bumpingStatus: BumpStatus;
}

export interface BotContext extends Omit<Scenes.SceneContext, "session"> {
  session: BotSessionData;
}
