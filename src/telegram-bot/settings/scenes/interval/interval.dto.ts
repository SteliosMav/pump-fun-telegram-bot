import { Min, Max, IsInt } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";

const { intervalInSeconds } = validationRules.bumpSettings;

export class IntervalInSecondsDto {
  @IsInt()
  @Min(intervalInSeconds.min)
  @Max(intervalInSeconds.max)
  intervalInSeconds!: number;
}
