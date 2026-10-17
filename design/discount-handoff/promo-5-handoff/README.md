# Oli: 5% discount tab and popup

Two ready-made files for Next.js / React. They recreate the design and animations exactly as they appear in the prototype.

## Files
- `PromoFivePercent.tsx`: the component (tab on the left side + popup)
- `PromoFivePercent.css`: the styles and animations

## Behavior
- **Side tab:** fixed to the left edge, vertically centered. On hover it widens from 58px to 64px and turns copper. The ✕ hides it.
- **Desktop:** a popup centered on the screen. It appears with a fade and grows from 96% to 100%, using cubic-bezier(.32,1.2,.4,1) over .45s. The image is on one side and the form on the other.
- **Mobile (<768px):** a bottom sheet that rises from below (.55s), with a drag handle and a large 5%.
- **Backdrop:** brown, 42% opacity, with a 3px blur.
- **Interactions:** the button is enabled only when the email is valid. After submitting, the code is shown with a copy button and a "To products" button. Esc closes the popup.

## Instructions for Cursor
> Add `promo-5-handoff/PromoFivePercent.tsx` and `.css` to the project as a component, and render it once in the site's shell (components/shell.tsx). Pass `hidden` when the user is logged in or the cart or menu is open, `onSubmitEmail` connected to the existing newsletter system, `onShop` that navigates to the products page, and `code` with the real coupon code. Don't change the design or the animations.

Fonts: Google Sans + Heebo (already on the site).


## Update: slim mobile tab + entrance animation
- The tab appears only **6 seconds** after entering the site (`delayMs` prop). It slides in from the left side with a bounce, then the gift icon wiggles once and the close button fades in.
- On mobile (<768px) the tab is slimmer: width 44px, without the word "הנחה", a bit lower on the screen (58%).
- Respects `prefers-reduced-motion`.

> **Instructions for Cursor:** update the existing `PromoFivePercent` component with the new versions of `PromoFivePercent.tsx` and `PromoFivePercent.css` from `promo-5-handoff/`. Don't change the existing logic (email, code, onShop). Just replace the files. The new `delayMs` prop is optional.
