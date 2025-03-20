import _ from "lodash";

export function isBotBlockedError(e: unknown): boolean {
  return (
    _.isObject(e) &&
    "response" in e &&
    _.isObject(e.response) &&
    "error_code" in e.response &&
    e.response.error_code === 403
  );
}
