export interface Env {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  SITE_ORIGIN: string;
  GITHUB_ALLOWED_LOGIN: string;
}

export const stateCookieName = '__Host-cms-state';

export function responseHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };
}

export function errorResponse(message: string, status: number) {
  return new Response(message, { status, headers: { ...responseHeaders(), 'Content-Type': 'text/plain; charset=utf-8' } });
}

export function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
