import { buildDataSourceOptions } from "./data-source-options";

describe("buildDataSourceOptions", () => {
  const env = {
    MYSQLDB_HOST: "db.internal",
    MYSQLDB_USER: "app",
    MYSQLDB_PASSWORD: "s3cret",
    MYSQLDB_NAME: "inventory",
  };

  it("never enables synchronize, whatever ENV says", () => {
    expect(buildDataSourceOptions({ ...env, ENV: "dev" }).synchronize).toBe(false);
    expect(buildDataSourceOptions({ ...env, ENV: "production" }).synchronize).toBe(false);
  });

  it("registers the migrations directory", () => {
    expect(buildDataSourceOptions(env).migrations).toHaveLength(1);
  });

  it("defaults only the port", () => {
    expect(buildDataSourceOptions(env).port).toBe(3306);
    expect(buildDataSourceOptions({ ...env, MYSQLDB_PORT: "3307" }).port).toBe(3307);
  });

  it.each(["MYSQLDB_HOST", "MYSQLDB_USER", "MYSQLDB_PASSWORD", "MYSQLDB_NAME"])("aborts when %s is missing", name => {
    const partial: Record<string, string | undefined> = { ...env };
    delete partial[name];
    expect(() => buildDataSourceOptions(partial)).toThrow(name);
    expect(() => buildDataSourceOptions({ ...partial, [name]: "" })).toThrow(name);
  });

  it("rejects an invalid port", () => {
    expect(() => buildDataSourceOptions({ ...env, MYSQLDB_PORT: "abc" })).toThrow("MYSQLDB_PORT");
  });
});
