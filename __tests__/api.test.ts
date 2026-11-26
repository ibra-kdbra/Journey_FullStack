import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchQuestions,
  fetchCategories,
  clearCategoriesCache,
  HttpError,
  InvalidParameterError,
  NoResultsError,
  RateLimitError,
  TokenError,
} from "@/lib/api";

function mockResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("lib/api fetchWithRetry", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    clearCategoriesCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function run<T>(p: Promise<T>) {
    const settled = p.then(
      (v) => ({ ok: true as const, v }),
      (e) => ({ ok: false as const, e })
    );
    await vi.runAllTimersAsync();
    return settled;
  }

  it("returns data when response_code is 0", async () => {
    fetchMock.mockResolvedValue(mockResponse({ response_code: 0, results: [] }));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(r.ok).toBe(true);
  });

  it("throws HttpError on non-2xx without retrying 4xx", async () => {
    fetchMock.mockResolvedValue(mockResponse({}, 404));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(HttpError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries 5xx then throws HttpError", async () => {
    fetchMock.mockResolvedValue(mockResponse({}, 503));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(HttpError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("maps HTTP 429 to RateLimitError", async () => {
    fetchMock.mockResolvedValue(mockResponse({}, 429));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(RateLimitError);
  });

  it("throws NoResultsError on response_code 1", async () => {
    fetchMock.mockResolvedValue(mockResponse({ response_code: 1, results: [] }));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(NoResultsError);
  });

  it("throws InvalidParameterError on response_code 2", async () => {
    fetchMock.mockResolvedValue(mockResponse({ response_code: 2, results: [] }));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(InvalidParameterError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([3, 4])("throws TokenError on response_code %i", async (code) => {
    fetchMock.mockResolvedValue(mockResponse({ response_code: code, results: [] }));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(TokenError);
  });

  it("throws RateLimitError on response_code 5 after retries", async () => {
    fetchMock.mockResolvedValue(mockResponse({ response_code: 5, results: [] }));
    const r = await run(fetchQuestions({ amount: 5 }));
    expect(!r.ok && r.e).toBeInstanceOf(RateLimitError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("accepts the category endpoint, which has no response_code", async () => {
    fetchMock.mockResolvedValue(mockResponse({ trivia_categories: [{ id: 9, name: "General" }] }));
    const r = await run(fetchCategories());
    expect(r.ok).toBe(true);
  });
});
