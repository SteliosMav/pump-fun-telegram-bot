import { Injectable } from "@nestjs/common";

@Injectable()
export class HomeService {
  startBumping(userId: number): Promise<string> {
    console.log(`Started bumping for user ${userId}`);
    // Add database save logic here
    return new Promise((resolve) => {
      setTimeout(() => resolve("signature"), 4000);
    });
  }
}
