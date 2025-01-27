import { Injectable } from "@nestjs/common";

@Injectable()
export class HomeService {
  bump(userId: number): Promise<string> {
    // Add database save logic here
    return new Promise((resolve) => {
      setTimeout(() => resolve("signature"), 4000);
    });
  }
}
