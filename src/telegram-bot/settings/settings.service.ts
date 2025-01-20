import { Injectable } from "@nestjs/common";

@Injectable()
export class SettingsService {
  saveSlippage(userId: number, slippage: number): void {
    console.log(`Saved slippage ${slippage} for user ${userId}`);
    // Add database save logic here
  }
}
