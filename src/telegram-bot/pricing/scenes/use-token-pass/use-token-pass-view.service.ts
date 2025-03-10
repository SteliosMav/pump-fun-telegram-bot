import { Injectable } from "@nestjs/common";

@Injectable()
export class UseTokenPassViewService {
  getSuccessMsg(): string {
    return `Congratulations, you've just redeemed a token-pass!
    
Enjoy ZERO service-fee bumps for this token!`;
  }

  getInsufficientTokenPassesMsg(): string {
    return `Sorry, you have no token-passes to use.`;
  }

  getPromptMsg(): string {
    return `Enter the pump.fun URL or the CA of the meme coin you want to use your pass for:`;
  }
}
