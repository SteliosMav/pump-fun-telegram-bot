import {
  LinkPreviewOptions,
  ParseMode,
} from "telegraf/typings/core/types/typegram";

/**
 * @NOTE All of the following commands and actions can go to their
 * corresponding modules. No need to be shared. They have modules.
 */
export enum SharedCommand {
  START = "start",
  INFO = "info",
  PRICING = "pricing",
  SETTINGS = "settings",
}

export enum SharedAction {
  GO_TO_HOME = "GO_TO_HOME",
  RENDER_HOME = "RENDER_HOME",
  GO_TO_SETTINGS = "GO_TO_SETTINGS",
  RENDER_SETTINGS = "RENDER_SETTINGS",
  GO_TO_PRICING = "GO_TO_PRICING",
  RENDER_PRICING = "RENDER_PRICING",
  GO_TO_INFO = "GO_TO_INFO",
  RENDER_INFO = "RENDER_INFO",
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
