import { Injectable } from "@nestjs/common";

@Injectable()
export class StartService {
  startBumping(userId: number): void {
    console.log(`Started bumping for user ${userId}`);
    // Add database save logic here
  }
}
