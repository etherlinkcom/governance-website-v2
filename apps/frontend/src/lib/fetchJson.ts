export async function fetchJson<T>(
  url: string,
  options?: RequestInit,
  maxAttempts = 5,
  initialDelay = 500
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch: ${response.status}`);
      }
      return await response.json() as T;
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) throw new Error("Too many failures. Please try again later.");
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Unexpected error when fetching data.");
}