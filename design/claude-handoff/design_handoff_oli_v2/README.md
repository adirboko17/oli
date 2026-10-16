# Handoff: Oli Safe Care — Website Redesign (v2)

## Overview
Full visual redesign of olisafecare.com (Hebrew, RTL e‑commerce for pregnancy / postpartum / baby skincare). Covers Home, Category, Product, Oli in Stores (Shilav), Podcast, SMS‑OTP login + Customer Account (orders, reviews), Legal pages (Accessibility / Terms / Privacy), plus global overlays: header + mega submenu, mobile menu, search, cart drawer, 5% promo tab + popup, floating accessibility widget.

**The design source of truth is `Oli Safe Care v2.dc.html`.** Ignore any older `Oli Safe Care.dc.html` (v1) or `Font Options.dc.html` that may already be in the repo.

## About the Design Files
The files here are **design references built in HTML** — a working prototype that shows intended look and behavior. They are **not production code**. Do not copy the HTML into the app and do not replace existing pages with it.

Target: the existing **Next.js** site (`app/`, `components/home-view.tsx`, `components/shell.tsx`, etc.).
- **Keep** the real catalog, product data, cart, checkout, navigation/routing and any auth/back‑end integrations exactly as they are.
- **Change only the presentation layer**: restyle and restructure existing components (and add new presentational components where a section doesn't exist yet) to match the prototype.
- Product names/prices/images in the prototype are mock data — always use the live catalog.

To view the prototype: open `Oli Safe Care v2.dc.html` in a browser (needs `support.js` and `assets/` next to it). Pages switch via the site's own header/menu/footer links. Resize the window to see the mobile layout (breakpoint logic below).

## Fidelity
**High‑fidelity.** Final colors, type, spacing, radii, interactions and copy. Recreate pixel‑close using the codebase's styling approach (Tailwind / CSS modules / whatever is in use). All styles in the prototype are inline — lift exact values from it.

## Global
- `dir="rtl"`, `lang="he"`. All layouts are right‑aligned; phone numbers, emails, and Latin product names are `direction:ltr` inline.
- Font: **Google Sans** (400/500/700) with **Heebo** fallback, for everything (headlines and body).
- Breakpoints used by the prototype (JS‑measured): `mobile < 768px`, `wide ≥ 1024px` (some grids switch at 960/1024). Use equivalent CSS media queries.
- Fluid sizing via `clamp()` is used heavily — reuse the same clamp values.
- Max content width: `1320px` (home/category), `1120px` (account, legal). Side padding `clamp(16px,4.5vw,32px)`.

## Design Tokens
Colors (hex):
- Ink / primary text & dark buttons: `#3A2826`
- Accent (copper): `#A85A3A` (hover on dark buttons)
- Body text: `#5E4844`, secondary `#6E5650`, muted `#8A6C64`, strikethrough `#9C847C`, legal body `#4E3B37`
- Peach: `#F3D9C6` (avatar, chips, highlights), light peach surfaces `#F8EFE9`, `#FBF5F1`, `#F6EEE8` (image tiles), `#FBF0E9`
- Lines/borders: `#EFE4DC`, `#F1E5DD`, `#E6D2C6`, `#E1CABD`, `#CDB5A8`, `#D8C3B6`
- Wave lines (Why Oli section): `#E9CDBD`
- Status: in transit `#D99A4E`, delivered `#6E9B6A`, error `#A33A2A`, star `#C9873E`
- White `#FFFFFF`

Radii: pills/buttons `999px`; cards `20px`; modals `28px` (desktop) / `26px 26px 0 0` (mobile sheets); inputs `14–16px`; thumbnails `12–16px`.
Shadows: modal `0 30px 80px rgba(42,28,26,.28)`; sheet `0 -20px 60px rgba(42,28,26,.25)`; soft card `0 10px 30px rgba(168,90,58,.06)`.
Backdrop: `rgba(42,28,26,.42)` + `backdrop-filter: blur(3px)`.
Type scale (headlines Google Sans 400, letter-spacing −.01 to −.05em): H1 `clamp(36px,6vw,64px)`; section H2 `clamp(34px,6.5vw,60px)`; olimini display `clamp(64px,11vw,144px)`; card titles 20–26px; body 15–17px / line-height 1.6–1.8; labels 12–13px with letter-spacing .08–.14em.
Easing: `cubic-bezier(.2,.8,.2,1)` (image hover), `cubic-bezier(.32,1.2,.4,1)` (modal pop), `cubic-bezier(.7,0,.2,1)` (drawers), `cubic-bezier(.65,0,.25,1)` (carousel).

## Screens / Views (Home, top → bottom)
1. **Promo marquee bar** (dark) + **Header**: logo, nav (דף הבית · המוצרים של Oli ⌄ submenu by category · Oli בחנויות · פודקאסט), icons (search, account, cart with count). "מתנות ליולדת" was intentionally removed from the top nav.
2. **Hero** with video, white background, gradient fade on mobile.
3. **לכל שלב במסע** — magazine rows: number, title, description, count →, product cut‑out thumbnail on `#F6EEE8` tile. Order: 01 הריון, 02 לידה ואחרי, 03 מתנות ליולדת, 04 תינוקות (uses `stage-baby.png`). Mobile: horizontal snap cards.
4. **המומחיות של Oli** — three pillars (carousel on mobile).
5. **olimini launch section** (new baby line): radial gradient stage `radial-gradient(120% 80% at 50% 78%,#FFF 0%,#F7EFEA 55%,#EFE3DB 100%)`; label "חדש"; giant "olimini"; one line copy; three transparent bottle cut‑outs standing in a row (middle Baby Spa Ritual ~112% size), soft elliptical shadow under each, name/sub/price below. Hover: bottle `scale(1.08)` from bottom. **Mobile:** auto‑looping carousel (3.2s), center item scale 1 / sides scale .72 & opacity .5, swipe + dots (active dot 22px wide pill).
6. **טיפול בסימני מתיחה בהריון, זאת המומחיות שלנו** (featured product) and **המומלצים שלנו** (4 product cards). On **mobile these two swap order** (stretch‑marks first). Mobile recommendations = horizontal snap carousel, 2 cards visible.
7. **למה Oli** — background `#FBF5F1` with thin SVG wave lines (stroke `#E9CDBD`, 1px, bottom + mirrored top at lower opacity). Desktop: 5 editorial columns, dark top rule, thin dividers between columns (none after the last), small copper numbers. Mobile: accordion (number · title · + in circle → rotates to ×; first item open).
8. **מתנות ליולדת** — large featured bundle + 2 side rows. **Auto‑rotates every 4.5s** (fade/translate .45s); side rows always show the two non‑featured bundles; clicking one features it; 3 thin progress lines under the featured item.
9. **המומחים מדברים** — Podcast card (square cover `podcast-cover.png`, ▶ badge) + Articles card (`research-2.png`).
10. **Oli באינסטגרם** — handle @oli_safecare, title, one line, 6 square tiles (hover: dark veil + IG icon), "לעקוב אחרינו" pill. Tiles are placeholders → wire to the Instagram feed later.
11. **Footer** — RTL, circular social icons; bottom row links: תקנון האתר · הצהרת נגישות · מדיניות פרטיות.

(The old 5% newsletter banner on the home page was intentionally removed.)

## Other Screens
- **Category**: text‑based filters (incl. new category "תינוקות · olimini"), sort, product grid. Product card: image tile, small "+" add button in corner, name/sub/price.
- **Product**: gallery, info, accordion (INCI etc.), **"אמהות משתמשות"** influencer story strip (9:16 cards, horizontal scroll, fullscreen story player with prev/next) placed **above "מתי להתחיל?"**, reviews, "אולי תאהבי גם".
- **Oli בחנויות**: hero text; Shilav logo inline in the subtitle (only the first mention), graphic `shilav-banner-2.png` (aspect 1448/1086); branches list.
- **Podcast**: episode list from `podcast-data.js` (78 episodes).
- **Legal** (`/legal` with tabs a11y / terms / privacy): peach header band with breadcrumb, H1, tab bar; sticky "בעמוד זה" TOC on desktop; numbered sections. Orange `[ … ]` markers = details the client must fill. Texts are templates — **must be reviewed by a lawyer**.

## Overlays & Interactions
- **Login (SMS OTP)** — centered modal desktop / bottom sheet mobile. Steps: phone (IL `05XXXXXXXX`, button enabled only when valid) → 6‑box OTP (auto‑submit on 6th digit, resend after 30s countdown, "שינוי מספר") → **new users only**: details form (שם מלא, גיל, אימייל, עיר, רחוב ומספר required; תאריך לידה משוער optional; button enabled when valid) → ✓ "היי {name}" → redirect to account. Existing users skip the form. Demo user: 0527488779 / 123456 (prototype only — replace with real SMS provider).
- **Account**: peach header (initial avatar, "שלום, {name}", phone, logout). Tabs: ההזמנות שלי / פרטים אישיים / כתובות. New‑user 5% banner. **Order cards expand** to show line items (thumb, qty, price), shipping timeline (התקבלה → נארזה ונשלחה → בדרך אלייך → נמסרה), address, subtotal/shipping/total, reorder. **Reviews**: delivered items show "כתיבת ביקורת" → modal (product header on peach band, 5 large stars with labels, textarea, optional photo upload with preview/replace/remove, publish enabled after rating). After publishing the item shows stars/text/photo + "עריכה". Undelivered items show "אפשר לכתוב ביקורת אחרי שההזמנה תגיע".
- **Cart drawer**: RTL, count chip, free‑shipping progress card (threshold ₪250), line items with qty stepper, subtotal, checkout button. Keep the real cart logic.
- **Search**: mobile = top sheet (auto height, max 82dvh, rounded bottom corners) over blurred backdrop; desktop = top panel.
- **5% promo**: vertical tab fixed on the **left** edge (hidden when user is logged in or another overlay is open; dismissible ✕). Opens popup: desktop split (image + form), mobile bottom sheet. Email → shows code (placeholder `OLI5`, copy button). Replace code with the real one.
- **Accessibility widget**: round dark button fixed **bottom‑right**; panel: text size (100–140% via zoom), high contrast, highlight links, readable font, stop animations, reset, link to statement. Settings persisted in localStorage (`oli-a11y`). Implemented as `html[data-a11y-*]` attribute toggles + global CSS.
- Mobile menu (animated), marquee, timeline — keep as approved.

## State (presentational)
`page/legalTab`, overlay flags (menu, search, cartOpen, account, promoOpen, a11yOpen), login flow (`accStep`, phone, code, resend timer, form fields), account (`acctTab`, `openOrder`, `reviews`, review modal draft), carousels (`miniIdx`, `giftIdx`), `whyOpen`, accessibility (`a11y`, `a11yZoom`). Map these onto the app's existing state/routing; real data (orders, user, reviews) must come from the back end.

## Assets (in `assets/`)
- `logo-brown.png` — new minimalist logo
- `about-video.mp4` — hero/about video
- `olimini-*-cut.png` — transparent cut‑outs of the 3 baby products (use these on the launch section); `olimini-*.png` — originals on white
- `stage-preg/birth/gift/baby.png` — cut‑outs for "לכל שלב במסע"
- `olineum-clean.png`, `oliglow-clean.png`, `gift-clean.png` — product cut‑outs
- `podcast-cover.png`, `research-2.png` — "המומחים מדברים" cards
- `shilav-logo.png` (transparent), `shilav-banner-2.png` — Oli בחנויות
Other product photos are loaded from the current Wix media URLs inside the prototype — use the catalog's own images in production.

## Files
- `Oli Safe Care v2.dc.html` — the full prototype (all pages, overlays, logic class at the bottom with mock data `P`, `CATS`)
- `support.js` — runtime needed only to open the prototype locally
- `podcast-data.js` — podcast episode list
- `assets/` — images/video above

## Suggested prompt for Cursor / Claude Code
> Implement the design from `design_handoff_oli_v2/Oli Safe Care v2.dc.html` (read `design_handoff_oli_v2/README.md` first) on the existing Next.js site. Keep the catalog, cart, checkout, routing and integrations unchanged — change only the presentation. Work section by section, starting with the header/footer shell, then the home page sections in order, then the remaining pages and overlays.
