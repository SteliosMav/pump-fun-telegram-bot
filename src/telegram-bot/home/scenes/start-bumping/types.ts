import { BotContext } from "../../../bot.context";

/**
 * Overwrite scene state for StartBumpingScene Context:
 */
interface StartBumpingSceneState {
  mint: string;
}
interface StartBumpingSceneScene extends Omit<BotContext["scene"], "state"> {
  state: StartBumpingSceneState;
}
export interface StartBumpingSceneCtx extends Omit<BotContext, "scene"> {
  scene: StartBumpingSceneScene;
}
