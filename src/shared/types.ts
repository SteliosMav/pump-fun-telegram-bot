interface BasicResponse<T extends boolean> {
  success: T;
}
type ErrorCodes = "INSUFFICIENT_BALANCE" | "UNKNOWN_ERROR";
export interface SuccessResponse<T> extends BasicResponse<true> {
  data: T;
}
export interface ErrorResponse extends BasicResponse<false> {
  code: ErrorCodes;
  error?: unknown;
  message?: string;
}
export type CustomResponse<T> = SuccessResponse<T> | ErrorResponse;
