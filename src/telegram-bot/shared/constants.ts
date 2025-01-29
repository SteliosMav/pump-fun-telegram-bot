import {
  LinkPreviewOptions,
  ParseMode,
} from "telegraf/typings/core/types/typegram";

export enum SharedCommand {
  START = "start",
}

export enum SharedAction {
  GO_TO_HOME = "GO_TO_HOME",
  RENDER_HOME = "RENDER_HOME",
  GO_TO_SETTINGS = "GO_TO_SETTINGS",
  RENDER_SETTINGS = "RENDER_SETTINGS",
  GO_TO_PRICING = "GO_TO_PRICING",
  RENDER_TOKEN_PASS = "RENDER_TOKEN_PASS",
}

export const DEFAULT_REPLY_OPTIONS: {
  parse_mode: ParseMode;
  link_preview_options: LinkPreviewOptions;
} = {
  parse_mode: "Markdown",
  link_preview_options: {
    is_disabled: true,
  },
};
