# Oli: olimini To Go strip + "ההבטחה של olimini"

## Files
- `OliminiToGo.tsx` + `OliminiToGo.css`: the To Go strip. The heading side has "To Go" as a large wordmark with "Olimini" below it, a subtitle, one line of text, and the kit price with "הוספת שלושתם לסל". The product side has 3 small cards on pastel backgrounds, each with the bottle, name, size · price and a round "+" button. On hover the bottle lifts slightly. Below 768px the cards turn into a snapping carousel.
- `OliminiPromise.tsx` + `OliminiPromise.css`: the "ההבטחה של olimini" section, with the title "עדין מספיק ליום הראשון". On desktop, three numbers (0+, 0%, 3) sit centered in a white card on a cream background with thin dividers between them. Below 768px each number becomes a row, with the number on one side and the text beside it.

## Instructions for Cursor
> Add two sections to the olimini category page using the `olimini-togo-handoff/` files, without changing the design:
> 1. Copy the files to `components/olimini/`.
> 2. Directly below the "החבילה של olimini" section, render `<OliminiToGo products={...} kitPrice={...} onAdd={...} onAddKit={...} />`.
>    - `products` come from the catalog (To Go products: `id, name, size, price, image`).
>    - `onAdd` adds one product to the existing cart and `onAddKit` adds the kit. If there's no kit, omit `kitPrice` and the kit line disappears.
> 3. Directly below it, render `<OliminiPromise />`. The default texts are built in, and you can pass `items` to change them.
> 4. Fonts: Google Sans + Heebo, already loaded on the site.

## Note
The names, sizes and prices in the To Go design (Pre & Shower / After Shower / Baby Spa To Go, 50 מ״ל, ₪39/₪39/₪45, kit ₪99) are placeholders. The images are the regular bottles. Replace them with the real To Go products.
