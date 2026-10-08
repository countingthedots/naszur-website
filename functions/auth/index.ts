import { errorResponse, responseHeaders, stateCookieName, type Env } from '../_lib/oauth';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (new URL(request.url).origin !== env.SITE_ORIGIN) {
    return errorResponse('Open the admin panel at the production site to log in.', 403);
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return errorResponse('Admin login is not configured yet. Follow the GitHub OAuth setup in the repository README.', 503);
  }
  const state = crypto.randomUUID();
  const authorization = new URL('https://github.com/login/oauth/authorize');
  authorization.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorization.searchParams.set('redirect_uri', `${env.SITE_ORIGIN}/auth/callback`);
  authorization.searchParams.set('scope', 'public_repo');
  authorization.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      ...responseHeaders(),
      Location: authorization.href,
      'Set-Cookie': `${stateCookieName}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
};
