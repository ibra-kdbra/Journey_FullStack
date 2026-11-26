import type { TriviaAPIResponse, CategoryAPIResponse, Category } from "@/types";

const API_BASE = "https://opentdb.com";

// Cache for categories (they rarely change)
let categoriesCache: Category[] | null = null;
let categoriesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting state
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Simple retry with exponential backoff
async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  delay = 1000
): Promise<T> {
  // Rate limiting: wait if needed
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          if (i < retries - 1) {
            await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
            continue;
          }
          throw new RateLimitError("Too many requests. Please wait 5 seconds and try again.");
        }
        throw new HttpError(response.status, `Trivia API request failed with HTTP ${response.status}.`);
      }
      const data = await response.json();
      
      // OpenTDB specific: response_code 5 means rate limited
      if (data.response_code === 5) {
        if (i < retries - 1) {
          // Wait longer on rate limit (2s, 4s, 6s)
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
          continue;
        }
        throw new RateLimitError("Too many requests. Please wait 5 seconds and try again.");
      }
      
      // response_code 1 = No results
      if (data.response_code === 1) {
        throw new NoResultsError("No questions available for this category/difficulty combination.");
      }
      
      // response_code 2 = invalid parameter
      if (data.response_code === 2) {
        throw new InvalidParameterError("Invalid request parameter sent to the trivia API.");
      }

      // response_code 3 = token not found, 4 = token exhausted
      if (data.response_code === 3 || data.response_code === 4) {
        throw new TokenError(
          data.response_code === 3
            ? "Trivia API session token not found."
            : "Trivia API session token has returned all available questions."
        );
      }

      // Any other non-zero code is unknown; the category endpoint has no response_code
      if (data.response_code !== undefined && data.response_code !== 0) {
        throw new Error(`Trivia API returned unexpected response code ${data.response_code}.`);
      }

      return data as T;
    } catch (error) {
      if (
        error instanceof RateLimitError ||
        error instanceof NoResultsError ||
        error instanceof InvalidParameterError ||
        error instanceof TokenError ||
        (error instanceof HttpError && error.status >= 400 && error.status < 500)
      ) {
        throw error;
      }
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error("Failed after retries");
}

// Custom error classes for better error handling
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class NoResultsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoResultsError";
  }
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export class InvalidParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidParameterError";
  }
}

export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenError";
  }
}

export async function fetchQuestions(params: {
  amount: number;
  category?: number;
  difficulty?: string;
  type?: string;
}): Promise<TriviaAPIResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("amount", String(params.amount));
  
  if (params.category && params.category !== 0) {
    searchParams.append("category", String(params.category));
  }
  if (params.difficulty) {
    searchParams.append("difficulty", params.difficulty);
  }
  if (params.type) {
    searchParams.append("type", params.type);
  }
  
  const url = `${API_BASE}/api.php?${searchParams.toString()}`;
  return fetchWithRetry<TriviaAPIResponse>(url);
}

export async function fetchCategories(): Promise<CategoryAPIResponse> {
  // Check cache first
  const now = Date.now();
  if (categoriesCache && (now - categoriesCacheTime) < CACHE_DURATION) {
    return { trivia_categories: categoriesCache };
  }
  
  const url = `${API_BASE}/api_category.php`;
  const result = await fetchWithRetry<CategoryAPIResponse>(url);
  
  // Update cache
  categoriesCache = result.trivia_categories;
  categoriesCacheTime = now;
  
  return result;
}

// Get cached categories (sync, for UI use)
export function getCachedCategories(): Category[] {
  return categoriesCache || [];
}

// Clear cache if needed
export function clearCategoriesCache(): void {
  categoriesCache = null;
  categoriesCacheTime = 0;
}
