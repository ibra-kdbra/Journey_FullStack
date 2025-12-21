/** @notice library imports */
import { grabEnv } from "@rajmazumder/grabenv";

/// Interface of Env
interface IEnvironments {
  PORT?: number;

  /// Database ///
  DATABASE_URL: string;
}

/// Environments
export const Environments = grabEnv<IEnvironments>({
  PORT: {
    type: "number",
    defaultValue: 3000,
  },

  /// Database ///
  DATABASE_URL: {
    type: "string",
  },
});

export const DATABASE_MIGRATIONS_PATH = "./migrations";
export const isInTesting = Environments.NODE_ENV === "test";
export const isInDevelopment = Environments.NODE_ENV === "development";
