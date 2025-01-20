import { Scenes } from "telegraf";

export interface BotSessionData extends Scenes.SceneSessionData {
  lastCallback?: string | null;
  slippage?: number;
}

export interface BotContext extends Omit<Scenes.SceneContext, "session"> {
  session: BotSessionData;
}
