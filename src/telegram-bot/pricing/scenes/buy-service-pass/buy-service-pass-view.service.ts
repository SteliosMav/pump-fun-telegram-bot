import { Injectable } from "@nestjs/common";

@Injectable()
export class BuyServicePassViewService {
  getSuccessMsg(): string {
    return `Congratulations, you've just bought a service-pass!
    
Enjoy ZERO service-fee bumps!`;
  }
}
