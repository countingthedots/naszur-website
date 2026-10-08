import type { APIRoute } from 'astro';
import { publishedPosts } from '../lib/content';
import site from '../data/site.json';

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!);
}

export const GET: APIRoute = async ({ site: siteUrl }) => {
  const items = (await publishedPosts()).map((post) => {
    const url = new URL(`/blog/${post.id}/`, siteUrl).href;
    return `<item><title>${escapeXml(post.data.title)}</title><description>${escapeXml(post.data.description)}</description><link>${escapeXml(url)}</link><guid>${escapeXml(url)}</guid><pubDate>${post.data.date.toUTCString()}</pubDate></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(site.name)}</title><description>${escapeXml(site.description)}</description><link>${siteUrl}</link>${items}</channel></rss>`, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
