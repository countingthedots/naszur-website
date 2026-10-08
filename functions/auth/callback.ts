import { errorResponse, responseHeaders, scriptJson, stateCookieName, type Env } from '../_lib/oauth';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (url.origin !== env.SITE_ORIGIN) return errorResponse('Invalid callback origin.', 403);
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${stateCookieName}=`))?.slice(stateCookieName.length + 1);
  const code = url.searchParams.get('code');
  if (!state || !cookie || state !== cookie || !code) return errorResponse('Login expired or was cancelled. Please try again from the admin panel.', 400);
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_ALLOWED_LOGIN) return errorResponse('Admin login is not configured.', 503);

  const clearCookie = `${stateCookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${env.SITE_ORIGIN}/auth/callback` }),
    });
    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenResponse.ok || !tokenData.access_token || tokenData.error) return errorResponse('GitHub could not complete the login. Please try again.', 502);

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'naszur-cms' },
    });
    const user = await userResponse.json() as { login?: string };
    if (!userResponse.ok || user.login?.toLowerCase() !== env.GITHUB_ALLOWED_LOGIN.toLowerCase()) return errorResponse('This account is not allowed to edit the website.', 403);

    const nonce = crypto.randomUUID();
    const message = `authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' })}`;
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Admin login</title></head><body><p>Completing login. You can close this window after the admin panel opens.</p><script nonce="${nonce}">const origin=${scriptJson(env.SITE_ORIGIN)};const message=${scriptJson(message)};if(window.opener){window.addEventListener('message',function receive(event){if(event.origin!==origin||event.source!==window.opener||event.data!=='authorizing:github')return;window.removeEventListener('message',receive);window.opener.postMessage(message,origin);window.close();});window.opener.postMessage('authorizing:github',origin);}</script></body></html>`;
    return new Response(html, {
      headers: {
        ...responseHeaders(),
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
        'Set-Cookie': clearCookie,
      },
    });
  } catch {
    return errorResponse('GitHub is temporarily unavailable. Please try again.', 502);
  }
};
