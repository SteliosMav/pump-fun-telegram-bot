import { Min, Max, IsInt, IsNumber } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";

const { intervalInSeconds } = validationRules.bumpSettings;

export class IntervalInSecondsDto {
  @IsNumber()
  @Min(intervalInSeconds.min)
  @Max(intervalInSeconds.max)
  intervalInSeconds!: number;
}
