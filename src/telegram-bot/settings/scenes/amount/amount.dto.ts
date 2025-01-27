import { Min, Max, IsNumber } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";
import { IsSol } from "../../../../shared";

const { amount } = validationRules.bumpSettings;

export class AmountDto {
  /**
   * Amount is stored and used internally as lamports, but user's
   * input format is SOL.
   */
  @IsSol()
  @Min(amount.min)
  @Max(amount.max)
  amount!: number;
}
