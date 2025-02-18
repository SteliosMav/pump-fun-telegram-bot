import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsSol(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isSol",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
            return false; // Value must be a valid number
          }

          // Check if the value has more decimal places than allowed
          const decimals = Math.log10(LAMPORTS_PER_SOL); // This calculates 9 decimals for 1 SOL
          const decimalPlaces = value.toString().split(".")[1]?.length || 0;

          return decimalPlaces <= decimals;
        },
        defaultMessage(args: ValidationArguments) {
          return `${
            args.property
          } must be a valid SOL amount with up to ${Math.log10(
            LAMPORTS_PER_SOL
          )} decimal places.`;
        },
      },
    });
  };
}
