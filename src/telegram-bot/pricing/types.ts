import { UserDoc } from "../../core/user/types";

export type Plan = "PAY_PER_BUMP" | "TOKEN_PASS" | "SERVICE_PASS";

export type CalculateRequiredBalanceParams =
  | [plan: Exclude<Plan, "PAY_PER_BUMP">]
  | [plan: "PAY_PER_BUMP", user: UserDoc, mint?: string];
