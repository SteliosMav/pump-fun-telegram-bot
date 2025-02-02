import { Transform } from "class-transformer";
import { SolanaAccount, TrimmedString } from "../../../../shared/validators";

export class MintDto {
  @Transform(({ value }) => MintDto.extractMint(value))
  @TrimmedString()
  @SolanaAccount()
  mint!: string;

  /**
   * Extracts mint if it's a pump.fun URL
   */
  static extractMint(input: string): string {
    const urlPattern = /^https:\/\/pump\.fun\/coin\/([^\/]+)$/;
    return urlPattern.test(input) ? input.match(urlPattern)![1] : input;
  }
}
