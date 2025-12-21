export type SuccessResponse<T> = {
  data: T;
  success: true;
  message?: string;
};

export type ErrorResponse = {
  error: string;
  success: false;
  details?: string;
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR";
};
