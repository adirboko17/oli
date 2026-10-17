# Oli – Gift Card section

Files:
- gift-card-section.html — standalone section (HTML + CSS + vanilla JS). Open in a browser to preview.
- gift-card.png — card image (transparent PNG).

Integration notes for Cursor:
- All styles are scoped under `.oli-gc`. Colors are CSS variables at the top of the stylesheet.
- Fonts: Google Sans + Heebo (Google Fonts link in <head>).
- Preset amounts: 150 / 250 / 400 / 600. Custom amount: 50–2500 ₪ (MIN/MAX constants in the script).
- Clicking the CTA dispatches `oli:giftcard-buy` with `{ amount }` — hook this to the cart / checkout (see TODO in the script).
- Next steps to build: recipient name + email/phone, personal message, send date, gift-card code redemption at checkout.
- Respects prefers-reduced-motion (animation off).
