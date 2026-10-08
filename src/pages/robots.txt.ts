import type { APIRoute } from 'astro';

export const GET: APIRoute = () => new Response('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /auth\n', {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
