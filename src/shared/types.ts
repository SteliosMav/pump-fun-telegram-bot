/** Type util */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface BasicResponse<T extends boolean> {
  success: T;
}
type ErrorCodes =
  | "INSUFFICIENT_BALANCE"
  | "UNKNOWN_ERROR"
  | "FAILED_RETRIEVE_COIN_DATA"
  | "TRANSACTION_FAILED"
  | "USER_NOT_FOUND"
  | "DUPLICATE_IDENTIFIER"
  | "INVALID_PAYLOAD";
export interface SuccessResponse<T> extends BasicResponse<true> {
  data: T;
  code?: ErrorCodes;
}
export interface ErrorResponse extends BasicResponse<false> {
  code: ErrorCodes;
  error?: unknown;
  message?: string;
}
export type CustomResponse<T> = SuccessResponse<T> | ErrorResponse;
