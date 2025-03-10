import { Min, Max, IsNumber } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { IsSol } from "../../../../shared";

const { amountInSol } = validationRules.bumpSettings;

export class AmountDto {
  /**
   * Amount is stored and used internally as lamports, but user's
   * input format is SOL.
   */
  @IsSol()
  @Min(amountInSol.min)
  @Max(amountInSol.max)
  amount!: number;
}
