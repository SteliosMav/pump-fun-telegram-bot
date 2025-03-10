import { PublicKey } from "@solana/web3.js";
import { PumpFunOperationIDs } from "./types";

export const PUMP_FUN_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
export const PUMP_FUN_EVENT_AUTHORITY_ACCOUNT = new PublicKey(
  "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
);
export const PUMP_FUN_GLOBAL_ACCOUNT = new PublicKey(
  "4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"
);
export const PUMP_FUN_FEE_ACCOUNT = new PublicKey(
  "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM" // Previous
  // "62qc2CNXwrYqQScmEdiZFFAnJR262PxWEuNQtxfafNgV" // New
);

export const JITO_TIP_ACCOUNT = new PublicKey(
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"
);

// Use the same mint for testing to avoid extra rent charges.
export const TEST_MINT_ACCOUNT = new PublicKey(
  "9Ji6r29UGjXTbV3QV1o2BHMEN1UkdoEqZRvmqvK2pump"
);

export const PUMP_FUN_OPERATION_IDS: PumpFunOperationIDs = {
  BUY: "16927863322537952870",
  SELL: "12502976635542562355",
};

export const PUMP_FUN_FEE_PERCENT = 0.01;
