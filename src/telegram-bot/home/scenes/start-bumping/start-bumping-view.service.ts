import { Injectable } from "@nestjs/common";

@Injectable()
export class SetTokenToBumpViewService {
  getBumpingStartedMsg() {
    return `The bumping started!`;
  }

  getBumpingCancelledMsg() {
    return `The bumping was cancelled!`;
  }
}
