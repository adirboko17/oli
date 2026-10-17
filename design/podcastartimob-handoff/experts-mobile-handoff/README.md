# Oli: "המומחים מדברים" (the experts section on the home page), mobile version

## Files
- `ExpertsMobile.tsx`: two cards side by side. One is a dark podcast card with the cover image, a play button and "להאזנה". The other is a light articles card with an image, the article count and "לכל המאמרים".
- `ExpertsMobile.css`: the styles. The component appears only below 768px.

## Instructions for Cursor
> In the home page's "המומחים מדברים" section:
> 1. Add `<ExpertsMobile articlesCount={ARTICLES.length} />` from `experts-mobile-handoff/` right below the title and subtitle of the section (if there's no `articles.ts`, pass a number).
> 2. Hide the existing grid (the two horizontal rows) below 768px (`@media (max-width:767px){ display:none }`). On desktop, keep everything exactly as it is.
> 3. Check the image paths (`/assets/podcast-cover.png`, `/assets/research-2.png`) and the links (`/podcast`, `/articles`) against the project.
> 4. Don't change the design.
