import { getCollection } from 'astro:content';

export async function publishedPosts() {
  const now = new Date();
  const posts = await getCollection('posts', ({ data }) => !data.draft && data.date <= now);
  return posts.sort((first, second) => second.data.date.valueOf() - first.data.date.valueOf());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(date);
}
