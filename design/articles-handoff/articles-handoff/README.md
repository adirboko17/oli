# Oli: articles page + single article page

## Files
- `articles.ts`: all the articles data (52 articles), the categories, the card colors, and the default product per category.
- `ArticlesIndex.tsx`: the articles page. It has a header with the paragraph below the title, the "latest articles" marquee, category tabs with counts, search, a card grid, and "show more" (12 at a time).
- `ArticleView.tsx`: the single article page. It has breadcrumbs, a centered header (category, title, lead, author and update date), the main image, the body (headings, paragraphs, lists), a product callout with add to cart, and "more in [category]".
- `ArticleCard.tsx`: the card. An article with an image gets a photo card with the title below it. An article without an image gets a tinted text card with the title inside.
- `LatestMarquee.tsx`: a strip of the 10 latest articles that scrolls continuously and stops on hover.
- `Articles.css`: all the styles. The grid shows 2 per row on mobile. "More in" is a grid of 3 on desktop and a snapping carousel on mobile.

## Instructions for Cursor
> Add an articles section to the Next.js site using the `articles-handoff/` files, without changing the design:
> 1. Copy the folder to `components/articles/`.
> 2. Create `app/articles/page.tsx` that renders `<ArticlesIndex initialCategory={searchParams.category} />`.
> 3. Create `app/articles/[slug]/page.tsx` that fetches the article with `getArticle(params.slug)` (`notFound()` if it doesn't exist) and renders `<ArticleView article={...} getProduct={...} AddToCart={...} />`. Wire `getProduct` to the site's existing product catalog (name, sub, priceLabel, image, href) and `AddToCart` to the existing cart button.
> 4. Add `generateStaticParams` from `ARTICLES` and `generateMetadata` (title = article title, description = lead).
> 5. Add a "מאמרים" link to the main nav (between "Oli בחנויות" and "פודקאסט"), to the mobile menu, and to the footer under "ידע". Also link the "ידע מבוסס מחקר" card on the home page to `/articles`.
> 6. Fonts: Google Sans + Heebo, already loaded on the site.

## Adding content
- **Image for an article:** add `image: '/path/to/image.jpg'` to the article in `articles.ts`. The card switches to a photo card automatically, and the image also appears at the top of the article page.
- **Article body:** `body` is a list of blocks: `{type:'heading'}`, `{type:'paragraph'}`, `{type:'list', items:[{term, text}]}`. Only "סימני מתיחה בהיריון" has its full text so far. The rest show a placeholder until you add the text.
- **Order:** the order in `ARTICLES` is the display order. The first 10 appear in the marquee.
- **Current images under `/assets/stage-*` and `/assets/research*`** are temporary demo images only.

## SEO
The slugs were generated from the titles. If you want to keep the old Wix addresses (recommended, so search rankings aren't lost), replace each `slug` with the existing address or add 301 redirects in `next.config.js`.
