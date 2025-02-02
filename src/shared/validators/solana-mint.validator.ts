import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isValidSolanaAddress } from "../../core/solana";

/**
 * Validator Constraint: Ensures mint is a valid Solana address.
 */
@ValidatorConstraint({ name: "SolanaAccount", async: false })
export class IsSolanaMintConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return isValidSolanaAddress(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Invalid Solana address: "${args.value}" must be a valid Solana account.`;
  }
}

/**
 * Custom Decorator: Validates that a field is a Solana mint address.
 */
export function SolanaAccount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSolanaMintConstraint,
    });
  };
}
