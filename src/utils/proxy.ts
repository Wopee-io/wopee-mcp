import { setGlobalDispatcher, ProxyAgent } from "undici";

/** Sends the api requests through HTTPS_PROXY / HTTP_PROXY when one is set (either case). */
export function useProxyFromEnv(): void {
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  if (proxyUrl) {
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
    console.error(`[WOPEE]: Using proxy ${proxyUrl}`);
  }
}
