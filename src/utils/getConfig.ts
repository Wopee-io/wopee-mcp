export const getConfig = () => {
  const WOPEE_API_URL = process.env.WOPEE_API_URL ?? "https://api.wopee.io";
  const WOPEE_API_KEY = process.env.WOPEE_API_KEY ?? null;
  const WOPEE_PROJECT_UUID = process.env.WOPEE_PROJECT_UUID ?? null;

  return {
    WOPEE_API_URL,
    WOPEE_API_KEY,
    WOPEE_PROJECT_UUID,
  };
};
