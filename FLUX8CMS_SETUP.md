> Important: do not assume the target repo uses MDX. Some Flux8 tools use TSX article pages, some may use plain HTML, Astro, MDX, or Markdown. The connector must match the repo's real article file type and must also identify how the blog listing page gets new articles.

# Flux8CMS Connector Setup

You are setting up this repo to work with the Flux8CMS portal.
Do these things:

## File writing rule — applies to every file in this setup

Every file you create or modify must be written as raw source code. Do not wrap any file content in markdown code fences — no ` ```typescript `, ` ```tsx `, ` ```html `, ` ```mdx `, or any other fence. This rule covers `flux8cms.config.json`, the template file, and any other file you edit (e.g. App.tsx, blog listing files). The first character of each written file must be the first character of the actual source.

## Step 1 — Read existing article/blog implementation

Find how this repo implements articles/blog pages. Do not assume MDX.
Look for directories such as `content/blog`, `src/content`, `posts`, `_posts`, `src/pages/articles`, `src/app/blog`, `app/articles`, or plain HTML pages.
Read AT LEAST TWO existing article files in full, using whatever extension the repo actually uses: `.tsx`, `.jsx`, `.html`, `.astro`, `.mdx`, `.md`, etc.
Pay close attention to:
- The real file type routed by the app. This becomes `format`.
- The slug/URL convention. Example: `src/pages/articles/my-post.tsx` -> `/articles/my-post`.
- Frontmatter fields if the repo uses frontmatter, or metadata exports/constants if it uses TSX/JS/HTML.
- Required imports, component wrappers, layout components, SEO components, and exported metadata.
- CSS classes and exact styling patterns. The generated file must preserve the site's design.
- The H2/H3 heading structure within posts
- Any custom components used (callouts, underlines, badges, buttons, cards, CTA sections, image wrappers, etc.)
- Bullet point style (dash vs asterisk, spacing)
- Any recurring structural patterns (e.g. always ends with a CTA section)
- Image path format (relative vs absolute, `/public/` vs `/`)

## Step 2 — Read the blog listing/index/pagination code

Find the file(s) that make articles visible on the blog page. This is usually one of:
- An exported array like `src/data/articles.ts`
- A blog index route like `src/pages/blog.tsx`, `src/app/blog/page.tsx`, or `articles.html`
- A sitemap/search index file
- A pagination source that controls how many posts appear per page

Read these files and understand exactly how a new article should be added. If the repo scans a directory automatically, `listingFiles` can be omitted. If the repo uses an exported array or manual pagination, include that file in `listingFiles` with explicit instructions.

Also read the app's routing file (e.g. `App.tsx`, `src/routes.tsx`, `app/routes.ts`, `_app.tsx`, or equivalent). List every URL path that is actually defined as a route. You will need this in Step 4 to write a correct CTA link in the template.

## Step 3 — Create flux8cms.config.json

At the repo root, create `flux8cms.config.json` using this schema:

{
  "site": "<short-id-no-spaces>",
  "displayName": "<Human readable site name>",
  "url": "<live site URL>",
  "blogDir": "<path where new article files must be created>",
  "format": "<real output extension: tsx | jsx | html | astro | mdx | md>",
  "saveMode": "<raw for tsx/jsx/html/astro, frontmatter for md/mdx if needed>",
  "template": "templates/blog-post.<same extension as format>",
  "listingFiles": [
    {
      "path": "<file that powers the blog listing, if any>",
      "instruction": "<exact instructions for adding a new article while preserving ordering and pagination. The CMS uses this same file for deletions too — if the listing uses manual pagination or page arrays, note that here so the AI can recalculate page counts when a post is removed.>"
    }
  ],
  "frontmatterSchema": {
    // for MD/MDX/frontmatter sites only. For TSX/HTML sites, use {} unless there is real frontmatter.
  },
  "imageDir": "<public image path, e.g. public/blog/images>",
  "branch": "main",
  "description": "<one sentence describing what this site/tool does>",
  "generationNotes": "<repo-specific notes: route conventions, import rules, SEO component rules, classes to preserve>"
}

Important:
- If the repo uses TSX article pages, set `"format": "tsx"`, `"saveMode": "raw"`, and create `templates/blog-post.tsx`.
- If the repo uses plain HTML pages, set `"format": "html"`, `"saveMode": "raw"`, and create `templates/blog-post.html`.
- If the repo uses MDX, set `"format": "mdx"` and create `templates/blog-post.mdx`.
- Do not make MDX just because the CMS is called a blog CMS. Match the repo.

## Step 4 — Create templates/blog-post.<format>

Create the directory `templates/` and write `blog-post.<format>`.

This template must:
1. Use the same file language as the repo's article pages.
2. Include all required imports, wrappers, metadata exports, layout components, and CSS classes.
3. Include the frontmatter block only if existing posts actually use frontmatter.
4. Mirror the heading structure found in existing posts.
5. Preserve custom components exactly as they appear in existing posts.
6. Use the same bullet style and spacing as existing posts.
7. Use placeholder text like `{title}`, `{intro}`, `{section_heading}`, `{section_content}`, `{cta}` for fillable areas. Always include `{date}` as the placeholder for every date field in the file (datePublished, dateModified, the reader-visible date string, and any other date occurrences). The CMS injects today's ISO date at generation time — the template must make clear where all dates go.
8. Include recurring elements such as CTA sections, related tools, author boxes, schema markup, or FAQ blocks if existing posts have them. If CTA sections link to a tool page, the link must point to a route that actually exists in the routing file you read in Step 2 — never invent routes like `/get-started`. Use the most relevant real route (e.g. `/convert`, `/compress`, `/resize`) and record it in `generationNotes` as: "Primary CTA route: /the-real-route".
9. The template file must be raw source code only — see the global file writing rule at the top. Do not wrap it in markdown code fences.
10. Add this exact instruction to `generationNotes`: "Return raw file source only. Never wrap output in markdown code fences. The first character of the generated file must be the first character of the real source file."

The goal: when the AI fills this template, the output is indistinguishable in structure
from a manually written post on this site.

After creating the connector, confirm:
- The exact output file format and route convention
- The `blogDir` where new files will be created
- Whether the blog listing is automatic or which `listingFiles` will be updated
- The template file created