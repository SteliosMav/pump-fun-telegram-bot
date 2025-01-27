import { Min, Max, IsNumber } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { IsSol } from "../../../../shared";

const { priorityFee } = validationRules.bumpSettings;

export class PriorityFeeDto {
  @IsSol()
  @Min(priorityFee.min)
  @Max(priorityFee.max)
  priorityFee!: number;
}
