#!/usr/bin/env node

const DEFAULT_ROUTES = ["/api/health", "/", "/browse", "/lobby"];
const baseUrlInput =
  process.env.SMOKE_BASE_URL || process.argv[2] || "https://beerit.vercel.app";
const routes = (process.env.SMOKE_ROUTES || DEFAULT_ROUTES.join(","))
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);

function normalizeBaseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return new URL(`https://${value}`);
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

async function checkRoute(baseUrl, route) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const targetUrl = new URL(route, baseUrl).toString();

  try {
    const response = await fetch(targetUrl, {
      redirect: "follow",
      signal: controller.signal,
    });

    return {
      ok: response.status >= 200 && response.status < 400,
      route,
      status: response.status,
      url: response.url,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false,
      route,
      status: "ERR",
      url: targetUrl,
    };
  } finally {
    clearTimeout(timeout);
  }
}

const baseUrl = normalizeBaseUrl(baseUrlInput);
console.log(`Smoke checking ${routes.length} routes against ${baseUrl.origin}`);

const results = await Promise.all(routes.map((route) => checkRoute(baseUrl, route)));

for (const result of results) {
  const status = result.ok ? "PASS" : "FAIL";
  const detail = result.error ? ` - ${result.error}` : "";
  console.log(`${status} ${result.status} ${result.route}${detail}`);
}

const failed = results.filter((result) => !result.ok);

if (failed.length > 0) {
  console.error(`${failed.length} route smoke check(s) failed.`);
  process.exitCode = 1;
}
