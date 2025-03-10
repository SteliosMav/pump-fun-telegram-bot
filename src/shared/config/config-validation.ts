import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Configuration } from "./configuration";

export function validate(config: Record<string, unknown>): Configuration {
  const validatedConfig = plainToInstance(Configuration, config, {
    enableImplicitConversion: true, // Automatically converts values to their expected types
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      errors
        .map((err) => Object.values(err.constraints || {}).join(", "))
        .join("; ")
    );
  }

  return validatedConfig;
}
