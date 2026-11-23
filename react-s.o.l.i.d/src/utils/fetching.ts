import { AxiosError } from "axios";

export function handleAxiosError(err: AxiosError) {
  const status = err.response?.status;
  console.error(
    status
      ? `Request failed with status ${status}: ${err.message}`
      : `Request failed: ${err.message}`,
  );
}
