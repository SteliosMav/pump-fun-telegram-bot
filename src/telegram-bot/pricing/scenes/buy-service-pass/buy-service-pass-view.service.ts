import { Injectable } from "@nestjs/common";

@Injectable()
export class BuyServicePassViewService {
  getSuccessMsg(): string {
    return `Congratulations, you've just bought a service-pass!
    
Enjoy ZERO service-fee bumps!`;
  }

  getInsufficientBalanceMsg(requiredBalanceInSol: number): string {
    return `You do not have enough balance. Minimum required balance for a service-pass is: ${requiredBalanceInSol} (Solana fees included)`;
  }
}
