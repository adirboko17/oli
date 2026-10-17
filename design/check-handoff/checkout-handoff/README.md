# Oli: details & shipping page (checkout step 2)

The page between the cart and payment: cart ✓ → **details & shipping** → payment.

## Files
- `CheckoutDetails.tsx`: the full page. It contains:
  - The steps strip and the "כמעט שם" title
  - **Contact details**: full name, mobile phone, email, plus a "כניסה עם SMS" banner for guests
  - **Shipping**: home courier or pickup point. Shipping is free above ₪250. Address fields appear for home delivery; a city field plus a list of pickup points appears for pickup.
  - **Confirmation**: accepting the terms and privacy policy (required), and opting in to updates
  - **Order summary**: products, coupon, subtotal, shipping, discount and total. It is sticky on desktop and sits at the top of the page on mobile.
  - **Pay button**: inside the summary on desktop, and as a sticky bar at the bottom of the screen on mobile, with the amount to pay
- `CheckoutDetails.css`: all the styles. The mobile breakpoint is below 768px.

## Instructions for Cursor
> Create the page `app/checkout/page.tsx` that renders `<CheckoutDetails />` from `checkout-handoff/`. Don't change the design:
> 1. `items`: from the existing cart (id, name, sub, price, qty, image).
> 2. `user`: from the logged-in user (if there is one), so the fields fill in automatically.
> 3. `onEditCart`: opens the existing cart drawer. `onLogin`: opens the existing SMS login.
> 4. `validateCoupon`: a call to an API route (`/api/coupon`) that checks the code on the server and returns `{ ok, percent }`. Don't validate on the client.
> 5. `onPay`: a call to `/api/orders` that creates the order (with all the details in `CheckoutPayload`) and returns the payment provider's URL (Stripe / Meshulam / Tranzila / CardCom, etc.), then a redirect to it. **Recalculate the prices and shipping on the server**; don't trust the amounts sent from the client.
> 6. The cart's "המשך לתשלום" button should go to `/checkout`.
> 7. Pickup point: wire the list of pickup points to the shipping company's API (there's a TODO in the code).
> 8. Check that the `/terms`, `/privacy` and `/products` links match the site's routes.

## Defaults you can change
- `freeShippingFrom` = 250
- `shippingPrices` = `{ home: 29, pickup: 19 }`
