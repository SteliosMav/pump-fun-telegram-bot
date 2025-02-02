import { Injectable } from "@nestjs/common";

@Injectable()
export class BuyTokenPassViewService {
  getSuccessMsg(): string {
    return `Congratulations, you've just bought a token-pass!`;
  }

  getInsufficientBalanceMsg(requiredBalanceInSol: number): string {
    return `You do not have enough balance. Minimum required balance for a token-pass is: ${requiredBalanceInSol} (Solana fees included)`;
  }
}
