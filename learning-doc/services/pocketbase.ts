// services/pocketbase.ts
import PocketBase from "pocketbase";

let pb: PocketBase | null = null;

export const usePocketBase = () => {
  if (!pb) {
    const config = useRuntimeConfig();
    const url =
      (config.public.pocketbaseUrl as string) || "http://127.0.0.1:8090";
    pb = new PocketBase(url);
  }
  return pb;
};
