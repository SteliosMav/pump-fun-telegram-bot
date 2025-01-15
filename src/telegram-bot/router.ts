import { setAmountRequestController } from "./controllers/bump-amount/set-amount-request.controller";
import { setAmountResponseController } from "./controllers/bump-amount/set-amount-response.controller";
import { setBumpsLimitRequestController } from "./controllers/bumps-limit/set-bumps-limit-request.controller";
import { setBumpsLimitResponseController } from "./controllers/bumps-limit/set-bumps-limit-response.controller";
import { buyTokenResponseController } from "./controllers/buy-token-pass/buy-token-pass-response.controller";
import { errorController } from "./controllers/events/error.controller";
import { stopBumpingController } from "./controllers/events/stop-bumping.controller";
import { setIntervalRequestController } from "./controllers/interval/set-interval-request.controller";
import { setIntervalResponseController } from "./controllers/interval/set-interval-response.controller";
import { setPriorityFeeRequestController } from "./controllers/priority-fee/set-priority-fee-request.controller";
import { setPriorityFeeResponseController } from "./controllers/priority-fee/set-priority-fee-response.controller";
import { refreshBalanceController } from "./controllers/refresh-balance/refresh-balance.controller";
import { settingsController } from "./controllers/settings/settings.controller";
import { setSlippageRequestController } from "./controllers/slippage/set-slippage-request.controller";
import { setSlippageResponseController } from "./controllers/slippage/set-slippage-response.controller";
import { setTokenRequestController } from "./controllers/start-bumping/set-token-request.controller";
import { setTokenResponseController } from "./controllers/start-bumping/set-token-response.controller";
import { startController } from "./controllers/start/start.controller";
import { tokenPassController } from "./controllers/token-pass/token-pass.controller";
import { useTokenPassRequestController } from "./controllers/use-token-pass/use-token-pass-request.controller";
import { useTokenPassResponseController } from "./controllers/use-token-pass/use-token-pass-response.controller";
import { CallbackType, CBQueryCtrlMap, MsgCtrlMap } from "./types";

// Define callback (request) controllers
export const controllersMap: CBQueryCtrlMap = {
  [CallbackType.SET_AMOUNT]: setAmountRequestController,
  [CallbackType.SET_BUMPS_LIMIT]: setBumpsLimitRequestController,
  [CallbackType.DISMISS_ERROR]: errorController,
  [CallbackType.SET_INTERVAL]: setIntervalRequestController,
  [CallbackType.SET_SLIPPAGE]: setSlippageRequestController,
  [CallbackType.SET_PRIORITY_FEE]: setPriorityFeeRequestController,
  [CallbackType.REFRESH_BALANCE]: refreshBalanceController,
  [CallbackType.SET_TOKEN]: setTokenRequestController,
  [CallbackType.GO_TO_SETTINGS]: settingsController,
  [CallbackType.GO_TO_START]: startController,
  [CallbackType.STOP_BUMPING]: stopBumpingController,
  [CallbackType.GO_TO_TOKEN_PASS]: tokenPassController,
  [CallbackType.BUY_TOKEN_PASS]: buyTokenResponseController,
  [CallbackType.USE_TOKEN_PASS]: useTokenPassRequestController,
};

// Define message (response) controllers
export const responseControllersMap: MsgCtrlMap = {
  [CallbackType.SET_AMOUNT]: setAmountResponseController,
  [CallbackType.SET_BUMPS_LIMIT]: setBumpsLimitResponseController,
  [CallbackType.SET_INTERVAL]: setIntervalResponseController,
  [CallbackType.SET_PRIORITY_FEE]: setPriorityFeeResponseController,
  [CallbackType.SET_SLIPPAGE]: setSlippageResponseController,
  [CallbackType.SET_TOKEN]: setTokenResponseController,
  [CallbackType.USE_TOKEN_PASS]: useTokenPassResponseController,
};
