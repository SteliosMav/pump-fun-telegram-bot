import { Injectable } from "@nestjs/common";

@Injectable()
export class SetTokenToBumpViewService {
  getPromptMsg() {
    return `Enter the pump.fun URL or the CA of the meme coin you want to bump:`;
  }

  getInsufficientBalanceMsg(
    requiredBalanceInSol: number,
    bumpPriceInSol: number
  ): string {
    return `*Insufficient balance*: Minimum required balance to start bumping is: \`${requiredBalanceInSol}\`.
    
Note: *The bump amount won't be charged*, but it's needed to perform the buy/sell trades. The amount that will be charged is only: \`${bumpPriceInSol}\` SOL per bump.`;
  }
}
