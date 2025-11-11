import { getConfig } from "./getConfig.js";

export const requestClient = async <T>(
  query: string,
  variables: Record<string, any>
): Promise<T | null> => {
  const { WOPEE_API_URL, WOPEE_API_KEY } = getConfig();

  try {
    if (!WOPEE_API_KEY) {
      console.error("[REQUEST_CLIENT_ERROR]: WOPEE_API_KEY is not set");
      return null;
    }

    const headers = {
      api_key: WOPEE_API_KEY,
      "Content-Type": "application/json",
    } as Record<string, string>;

    const response = await fetch(`${WOPEE_API_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[REQUEST_CLIENT_ERROR]:", errorText);
      return null;
    }

    const result = (await response.json()) as {
      data?: any;
      errors?: Array<{ message: string }>;
    };

    if (result.errors && result.errors.length > 0) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    return result.data || null;
  } catch (error) {
    console.error("[REQUEST_CLIENT_ERROR]:", error);
    return null;
  }
};
