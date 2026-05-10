/**
 * Simple translation utility using a free/unauthenticated Google Translate API endpoint.
 * In a production environment, it's recommended to use an official API with a key.
 */

export async function translateToEnglish(text: string): Promise<string> {
  // Check if text is mostly English or doesn't need translation
  if (isLikelyEnglish(text)) {
    return text;
  }

  try {
    // Using a public proxy/endpoint for translation (for demonstration/simplicity)
    // Note: This is for educational purposes and might have rate limits.
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Translation request failed");
      return text;
    }

    const data = await response.json();

    // Google Translate 'single' API returns nested arrays
    // [[["translated text", "original text", null, null, 1]], null, "language"]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }

    return text;
  } catch (error) {
    console.error("Error during translation:", error);
    return text;
  }
}

/**
 * Basic heuristic to check if text is English.
 * Can be improved with a proper library like 'languagedetect' or 'franc'.
 */
function isLikelyEnglish(text: string): boolean {
  // Simple check for non-Latin characters
  // This covers many common non-English languages like Vietnamese, Korean, Chinese, etc.
  const nonLatinRegex =
    /[^\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F]/;

  // If it contains non-Latin characters, it's likely not just English
  if (nonLatinRegex.test(text)) {
    return false;
  }

  // Further checks could be added here
  return true;
}
