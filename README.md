# naszur website

Personal website built with Astro, TypeScript, and Decap CMS. Cloudflare Pages serves the static site. Two Pages Functions handle GitHub OAuth for the admin panel.

## Development

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

The site runs at http://localhost:4321. For local admin editing, run `npm run cms:local` in another terminal, then open http://localhost:4321/admin/. The local CMS server writes directly to the checkout without GitHub login. Never expose that server publicly.

```sh
npm run check
npm run build
```

## Content

- `/admin/` edits blog posts, photos, links, profile text, contact details, interests, experience, and education.
- Blog posts are Markdown files in `src/content/posts/`.
- Drafts and future-dated posts are excluded from the site and RSS feed.
- Publication dates are evaluated at build time. Future-dated posts need a new deployment after their date to appear.
- Profile, links, and gallery entries live in `src/data/`.
- Uploads live in `public/uploads/`. Resize photos before uploading, remove sensitive EXIF metadata, and keep files below Cloudflare's 25 MiB per-file limit. Enter their actual width and height in the gallery form.
- The starter post is a draft. The gallery intentionally starts empty.

## Using the admin panel

1. Open https://naszur.pages.dev/admin/ and choose GitHub login. Sign in as `countingthedots` and authorize the app. Allow the login popup if your browser blocks it.
2. Choose **Site content → Profile** to edit your name, role, bio, hobbies, Letterboxd address, contact details, interests, experience or education. Save/publish when finished.
3. Choose **Blog posts** and create a new entry. Add its title, short description, date and body. Tags are optional. Keep **Draft** checked to hide it from visitors. When ready, uncheck Draft, use today's date or an earlier date, and save/publish. The starter post can be edited or replaced.
4. Choose **Site content → Photos** and add an item to the Photos list. Upload/select an image, describe it in Alt text, add a caption if wanted, and enter the image's actual width and height in pixels. Save/publish the entry. Uploading a file to Media alone does not add it to the gallery.
5. Choose **Site content → Links** and add a title, a full `https://` address, and an optional description. Save/publish.

Each save/publish writes a commit to `main`. Cloudflare then builds the site. Your changes appear after the deployment succeeds, not immediately when you save. Check the deployment in Cloudflare Pages if an update does not appear.

There is no separate editorial review workflow. The Draft checkbox hides a blog post on the website, but its source and uploaded images are still in the public GitHub repository. Do not put private information in drafts or uploads. Future-dated posts need a rebuild after their date; they do not publish automatically.

The homepage portrait, drawings, colors and layout are managed in code. The Photos collection controls the separate gallery, not your homepage portrait.

## Cloudflare Pages

Project name: `naszur`. Production URL: https://naszur.pages.dev.

Connect `countingthedots/naszur-website` in Cloudflare Pages with these settings:

- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root
- Node.js version: `24` via the `NODE_VERSION` build environment variable

The GitHub repository is connected to this Pages project. Builds redeploy whenever the CMS commits to `main`. To deploy manually, run `npm run deploy` after authenticating Wrangler. This uploads `dist/` and the OAuth Functions together.

## GitHub OAuth setup

The public website does not need any secrets. Production CMS login needs a GitHub OAuth application:

1. The `naszur website admin` OAuth app is already registered at https://github.com/settings/applications/3915818. For a separate installation, create your own app at https://github.com/settings/developers.
2. Set its homepage to `https://naszur.pages.dev`.
3. Set its authorization callback URL to `https://naszur.pages.dev/auth/callback`.
4. The public `GITHUB_CLIENT_ID` is configured in `wrangler.jsonc`. The `GITHUB_CLIENT_SECRET` is stored as an encrypted Cloudflare Pages production variable. For a separate installation, change the public client ID and configure its encrypted secret, then redeploy. Never commit the secret.
5. Open https://naszur.pages.dev/admin/ and log in with `countingthedots`.

The `public_repo` OAuth scope is needed to publish to this public repository. GitHub grants that scope across your public repositories, not just this site. The callback only accepts the account named in `GITHUB_ALLOWED_LOGIN`, validates a short-lived HTTP-only state cookie, and sends the token only to the exact production origin.

For local testing of the Functions, copy `.dev.vars.example` to `.dev.vars`, supply credentials for a separate local OAuth app, and run `npm run dev:cloudflare -- --binding SITE_ORIGIN=http://localhost:8788`. Its callback must use the same local origin. Production login intentionally rejects preview/local origins; use local CMS mode for routine content editing.

The admin bundle uses a pinned Decap CMS release from unpkg with a verified Subresource Integrity hash. The local CMS server's `simple-git` and Joi dependencies are overridden to patched releases; keep those overrides when updating dependencies.

## Design

The homepage is a colorful desk collage: green painted wood, cream notebook pages, lemon graph paper, cobalt ink, pink binding, cut-paper links, and a contact envelope. A small repeating grain texture adds surface detail without SVG noise filters. Fonts are hosted locally. Shared layout: `src/layouts/Layout.astro`. Styles: `src/styles/global.css`.

The homepage portrait is `src/assets/nastassia-cutout.webp`, a transparent cutout from the supplied `Me-cut.jpg`. `src/assets/portrait-mask.svg` traces the silhouette so black clothing stays intact when removing the JPEG's black background. The generated WebP has no source metadata. Astro generates responsive image sizes at build time. To replace this portrait, update the cutout asset and its mask if needed. Gallery photos are managed separately in the admin panel.

Career entries in `src/data/site.json` use `title`, `organization`, `period`, and an optional `description`. Empty experience and education lists are not rendered. Add only verified career facts; do not upload full CVs or publish their private contents.
