import { Trim } from "class-sanitizer";
import { IsString } from "class-validator";

/**
 * Custom Decorator: Automatically trims and validates strings.
 */
export function TrimmedString() {
  return function (target: any, propertyKey: string) {
    IsString()(target, propertyKey);
    Trim()(target, propertyKey);
  };
}
