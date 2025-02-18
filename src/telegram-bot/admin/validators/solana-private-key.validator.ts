import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { isValidPrivateKey } from "../../../core/solana";

@ValidatorConstraint({ name: "SolanaPrivateKey", async: false })
export class IsPrivateKeyConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return isValidPrivateKey(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Invalid Solana private key`;
  }
}

// SolanaPrivateKey Decorator
export function SolanaPrivateKey(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPrivateKeyConstraint,
    });
  };
}
