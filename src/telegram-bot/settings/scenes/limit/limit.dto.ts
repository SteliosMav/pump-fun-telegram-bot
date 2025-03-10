import { Min, Max, IsNumber, IsInt } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";

const { limit } = validationRules.bumpSettings;

export class LimitDto {
  @IsInt()
  @Min(limit.min)
  @Max(limit.max)
  limit!: number;
}
