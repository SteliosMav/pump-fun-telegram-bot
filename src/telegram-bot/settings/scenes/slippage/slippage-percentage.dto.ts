import { Min, Max, IsInt } from "class-validator";
import { validationRules } from "../../../../shared/validation-rules";

const { slippage } = validationRules.bumpSettings;

export class SlippagePercentageDto {
  /**
   * Slippage is stored and used internally as a decimal, but user's
   * input format is percentage
   */
  @IsInt()
  @Min(slippage.min * 100)
  @Max(slippage.max * 100)
  slippagePercentage!: number;
}
