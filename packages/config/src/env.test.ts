import { describe, it, expect } from "vitest";
import { loadWebEnv } from "./web-env.js";
import { loadApiEnv } from "./api-env.js";
import { loadWorkerEnv } from "./worker-env.js";
import { loadDbEnv, parseRedisUrl } from "./common-env.js";

/* ----------------------------------------------------------------------- */
/*  loadWebEnv                                                             */
/* ----------------------------------------------------------------------- */

describe("loadWebEnv", () => {
  it("accepts a valid minimal env", () => {
    const env = loadWebEnv({
      NODE_ENV: "development",
      WEB_PORT: "3000",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000/api",
    });
    expect(env.NODE_ENV).toBe("development");
    expect(env.WEB_PORT).toBe(3000);
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe("http://localhost:4000/api");
  });

  it("applies defaults for optional fields", () => {
    const env = loadWebEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.WEB_PORT).toBe(3000);
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe("http://localhost:4000/api");
  });

  it("coerces WEB_PORT from string to number", () => {
    const env = loadWebEnv({ WEB_PORT: "8080" });
    expect(env.WEB_PORT).toBe(8080);
    expect(typeof env.WEB_PORT).toBe("number");
  });
});

/* ----------------------------------------------------------------------- */
/*  loadApiEnv                                                             */
/* ----------------------------------------------------------------------- */

const MINIMAL_API_ENV = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
};

describe("loadApiEnv", () => {
  it("accepts a valid env with required secrets", () => {
    const env = loadApiEnv(MINIMAL_API_ENV);
    expect(env.NODE_ENV).toBe("development");
    expect(env.API_PORT).toBe(4000);
    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/db");
    expect(env.REDIS_URL).toBe("redis://localhost:6379");
    expect(env.WEB_ORIGIN).toBe("http://localhost:3000");
    expect(env.S3_REGION).toBe("us-east-1");
    expect(env.S3_BUCKET).toBe("tumbfolio-local");
    expect(env.S3_FORCE_PATH_STYLE).toBe(false);
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() =>
      loadApiEnv({ REDIS_URL: "redis://localhost:6379" }),
    ).toThrow("Invalid api environment");
  });

  it("throws when DATABASE_URL is empty", () => {
    expect(() =>
      loadApiEnv({ DATABASE_URL: "", REDIS_URL: "redis://localhost:6379" }),
    ).toThrow("Invalid api environment");
  });

  it("throws when REDIS_URL is missing", () => {
    expect(() =>
      loadApiEnv({ DATABASE_URL: "postgres://user:pass@localhost:5432/db" }),
    ).toThrow("Invalid api environment");
  });

  it("throws when REDIS_URL is not a valid URL", () => {
    expect(() =>
      loadApiEnv({
        DATABASE_URL: "postgres://user:pass@localhost:5432/db",
        REDIS_URL: "not-a-url",
      }),
    ).toThrow("Invalid api environment");
  });

  it("coerces API_PORT from string to number", () => {
    const env = loadApiEnv({ ...MINIMAL_API_ENV, API_PORT: "8080" });
    expect(env.API_PORT).toBe(8080);
    expect(typeof env.API_PORT).toBe("number");
  });

  it("coerces S3_FORCE_PATH_STYLE from string to boolean", () => {
    const envTrue = loadApiEnv({ ...MINIMAL_API_ENV, S3_FORCE_PATH_STYLE: "true" });
    expect(envTrue.S3_FORCE_PATH_STYLE).toBe(true);

    const envFalse = loadApiEnv({ ...MINIMAL_API_ENV, S3_FORCE_PATH_STYLE: "false" });
    expect(envFalse.S3_FORCE_PATH_STYLE).toBe(false);

    const envDefault = loadApiEnv(MINIMAL_API_ENV);
    expect(envDefault.S3_FORCE_PATH_STYLE).toBe(false);
  });

  it("accepts empty OPENAI_API_KEY without failing", () => {
    const env = loadApiEnv({
      ...MINIMAL_API_ENV,
      OPENAI_API_KEY: "",
    });
    // Empty string is a valid non-secret value — does not crash
    expect(env.OPENAI_API_KEY).toBe("");
  });

  it("accepts missing OPENAI_API_KEY without failing", () => {
    const env = loadApiEnv(MINIMAL_API_ENV);
    expect(env.OPENAI_API_KEY).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------- */
/*  loadWorkerEnv                                                          */
/* ----------------------------------------------------------------------- */

const MINIMAL_WORKER_ENV = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  REDIS_URL: "redis://localhost:6379",
};

describe("loadWorkerEnv", () => {
  it("accepts a valid env with required secrets", () => {
    const env = loadWorkerEnv(MINIMAL_WORKER_ENV);
    expect(env.NODE_ENV).toBe("development");
    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/db");
    expect(env.REDIS_URL).toBe("redis://localhost:6379");
    expect(env.WORKER_QUEUES_ENABLED).toBe(false);
    expect(env.S3_REGION).toBe("us-east-1");
    expect(env.S3_BUCKET).toBe("tumbfolio-local");
    expect(env.S3_FORCE_PATH_STYLE).toBe(false);
  });

  it("throws when REDIS_URL is missing", () => {
    expect(() =>
      loadWorkerEnv({ DATABASE_URL: "postgres://user:pass@localhost:5432/db" }),
    ).toThrow("Invalid worker environment");
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() =>
      loadWorkerEnv({ REDIS_URL: "redis://localhost:6379" }),
    ).toThrow("Invalid worker environment");
  });

  it("coerces WORKER_QUEUES_ENABLED from string to boolean", () => {
    const envTrue = loadWorkerEnv({
      ...MINIMAL_WORKER_ENV,
      WORKER_QUEUES_ENABLED: "true",
    });
    expect(envTrue.WORKER_QUEUES_ENABLED).toBe(true);

    const envFalse = loadWorkerEnv({
      ...MINIMAL_WORKER_ENV,
      WORKER_QUEUES_ENABLED: "0",
    });
    expect(envFalse.WORKER_QUEUES_ENABLED).toBe(false);

    const envDefault = loadWorkerEnv(MINIMAL_WORKER_ENV);
    expect(envDefault.WORKER_QUEUES_ENABLED).toBe(false);
  });
});

/* ----------------------------------------------------------------------- */
/*  loadDbEnv                                                              */
/* ----------------------------------------------------------------------- */

describe("loadDbEnv", () => {
  it("accepts a valid DATABASE_URL", () => {
    const env = loadDbEnv({
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    });
    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/db");
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => loadDbEnv({})).toThrow("Invalid db environment");
  });

  it("throws when DATABASE_URL is empty", () => {
    expect(() => loadDbEnv({ DATABASE_URL: "" })).toThrow(
      "Invalid db environment",
    );
  });
});

/* ----------------------------------------------------------------------- */
/*  parseRedisUrl                                                          */
/* ----------------------------------------------------------------------- */

describe("parseRedisUrl", () => {
  it("parses a simple redis URL", () => {
    const result = parseRedisUrl("redis://localhost:6379");
    expect(result.host).toBe("localhost");
    expect(result.port).toBe(6379);
    expect(result.password).toBeUndefined();
  });

  it("parses a redis URL with password", () => {
    const result = parseRedisUrl("redis://:secret@redis.example.com:6380");
    expect(result.host).toBe("redis.example.com");
    expect(result.port).toBe(6380);
    expect(result.password).toBe("secret");
  });

  it("uses default port 6379 when omitted", () => {
    const result = parseRedisUrl("redis://localhost");
    expect(result.host).toBe("localhost");
    expect(result.port).toBe(6379);
  });
});
