import { Min, Max } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { IsSol } from "../../../../shared";

const { priorityFeeInSol } = validationRules.bumpSettings;

export class PriorityFeeDto {
  @IsSol()
  @Min(priorityFeeInSol.min)
  @Max(priorityFeeInSol.max)
  priorityFeeInSol!: number;
}
