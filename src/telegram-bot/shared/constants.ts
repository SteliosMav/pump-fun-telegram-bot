import {
  InlineKeyboardButton,
  LinkPreviewOptions,
  ParseMode,
} from "telegraf/typings/core/types/typegram";

export enum SharedCommand {
  START = "start",
}

export enum SharedAction {
  HOME = "HOME",
  SETTINGS = "SETTINGS",
  TOKEN_PASS = "TOKEN_PASS",
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
