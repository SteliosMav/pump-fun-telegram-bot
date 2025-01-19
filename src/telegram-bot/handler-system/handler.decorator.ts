import { SetMetadata } from "@nestjs/common";

export const HANDLER_METADATA = "handler:metadata";

export function Handler(command: string): ClassDecorator {
  return (target) => {
    SetMetadata(HANDLER_METADATA, { command })(target);
  };
}
