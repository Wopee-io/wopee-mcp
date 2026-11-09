const DEFAULT_API_URL = "https://api.wopee.io";

// Client configs pass unset variables through as "" (e.g. "${WOPEE_API_URL}" in mcp.json), so an
// empty value means "not set", never "use an empty URL".
const fromEnv = (name: string): string | null =>
  process.env[name]?.trim() || null;

export const getConfig = () => {
  const WOPEE_API_URL = fromEnv("WOPEE_API_URL") ?? DEFAULT_API_URL;
  const WOPEE_API_KEY = fromEnv("WOPEE_API_KEY");
  const WOPEE_PROJECT_UUID = fromEnv("WOPEE_PROJECT_UUID");
  const WOPEE_AUTH_TOKEN = fromEnv("WOPEE_AUTH_TOKEN");

  return {
    WOPEE_API_URL,
    WOPEE_API_KEY,
    WOPEE_PROJECT_UUID,
    WOPEE_AUTH_TOKEN,
  };
};
