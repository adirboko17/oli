# Oli: mobile menu

## Files
- `MobileMenu.tsx`: the burger button plus the small floating white card that opens below it. It includes the links, a "המוצרים של Oli" item that expands into category chips, the "החשבון שלי" button, and social icons.
- `MobileMenu.css`: styles and animations. The card scales open from the top-right corner with a slight bounce, the links fade in one after another, and the burger turns into an X.

## Instructions for Cursor
> Replace the existing mobile menu with `mobile-menu-handoff/MobileMenu.tsx` (+ CSS), without changing the design or animations:
> 1. In the mobile header (below 900px), put `<MobileMenu />` at the start of the header (on the right in RTL), in place of the current burger button. The header must be `position: sticky` (or `relative`), because the card is positioned relative to it.
> 2. Pass `categories` from the existing catalog: `{ label, href, count }` for each category.
> 3. Pass `onAccount` so it opens the existing login / personal area (SMS OTP).
> 4. Define the CSS variable `--oli-header-h` with the header height (including the promo bar if it is sticky). The backdrop starts below it.
> 5. Check that the paths in `LINKS` match the site's routes (`/products`, `/stores`, `/articles`, `/podcast`) and update them if needed.
> 6. The menu closes on navigation, on Escape, and on a tap outside it.
