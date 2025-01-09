import { PublicKey } from "@solana/web3.js";

// === Public Keys ===
export const PUMP_FUN_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
/**
 *
 * @WARNING Need to check if all of the following accounts are needed
 * for buy, sell and bump.
 *
 */

/** @note Unknown account, need to check if I need it */
export const UNKNOWN_ACCOUNT = new PublicKey(
  "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
);
/** @note The owner is pump.fun but I'm not sure what it is for */
export const GLOBAL = new PublicKey(
  "4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"
);
/** @note Public name: Pump.fun Fee Account - Owner: System Program  */
export const PUMP_FUN_FEE_ACCOUNT = new PublicKey(
  "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"
);

export const JITO_TIP_ACCOUNT = new PublicKey(
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"
);
// Use the same mint for testing to avoid extra rent charges.
export const TEST_MINT_ACCOUNT = new PublicKey(
  "9Ji6r29UGjXTbV3QV1o2BHMEN1UkdoEqZRvmqvK2pump"
);

// === Miscellaneous ===
export const PUMP_FUN_SWAP_FEE_PERCENT = 0.01;
export const ASSOCIATED_TOKEN_ACC_SIZE = 165;
