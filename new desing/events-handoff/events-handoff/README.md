# Oli: events page + single event page + home strip

Front end only. Backend points are marked `TODO`.

## Files
- `events.ts`: event type, demo data (6 events, one per status), date formatting in Hebrew, Google Calendar link, `.ics` download, and the registration data type.
- `EventsIndex.tsx`: the events page. It has a header, tabs ("אירועים קרובים" / "אירועים שהתקיימו") with counts, a large "המפגש הקרוב" card for the next open event, and the rest of the events. Desktop shows a card grid. Mobile shows compact rows (square image + text). When there are no upcoming events, it shows an empty state: three date tiles with "בקרוב", an email signup ("עדכנו אותי") and links to articles and the podcast.
- `EventView.tsx`: the single event page. It has breadcrumbs, the image, status + type, title, short description, and "על המפגש" (full description). The side panel is sticky on desktop and holds the details (date, time, location, price) and the form. On mobile the panel moves below the content, and a "להרשמה" button near the top scrolls to it. "עוד מפגשים" is a grid of 3 on desktop and a snapping carousel (up to 6) on mobile. Full, ended and cancelled events show a message instead of the form.
- `RegistrationForm.tsx`: full name, phone, email, "בהריון" / "ילדתי". "בהריון" lets her pick "תאריך לידה משוער" (date) or "שבוע הריון" (4–42). "ילדתי" asks for the baby's birth date. Then terms (required) and marketing (on by default). It validates on submit, and after success it shows the confirmation with "הוסיפי ליומן Google" and "Apple / Outlook (.ics)".
- `EventCard.tsx`: photo card (`EventCard`), compact mobile row (`EventRow`) and the status pill.
- `HomeEvents.tsx`: the home page strip "נפגשות בקרוב". Heading on one side, up to 3 rows on the other (large day number, title, day · time · type · price, arrow). It is hidden when there are no upcoming events.
- `NavKnowledge.tsx`: the desktop nav item "מאמרים ואירועים" with a dropdown (מאמרים / אירועים + counts), plus the links for the mobile menu.
- `Events.css`: all the styles (`oe-` prefix). Mobile breakpoint is 900px.

## Instructions for Cursor
> Add an events section to the Next.js site using the `events-handoff/` files, without changing the design:
> 1. Copy the folder to `components/events/`.
> 2. Create `app/events/page.tsx` that renders `<EventsIndex upcoming={...} past={...} />`. For now the defaults read from `events.ts`; later, pass data from the DB. Never send events with status `draft`.
> 3. Create `app/events/[slug]/page.tsx` that loads the event (`notFound()` if missing or draft) and renders `<EventView event={...} onRegister={...} />`. Add `generateMetadata` (title = event title, description = short).
> 4. `onRegister` (server action / API route) receives `RegistrationData`. TODO backend:
>    - Save the registration. Match it to an existing customer by phone or email.
>    - Send the confirmation email with the Zoom link. The link never appears on the page.
>    - Schedule reminders one day before and one hour before (email, and SMS if available).
>    - For paid events (`price > 0`), run the store's existing checkout (same payment + invoice + email) and resolve only after payment succeeds. Throw on failure and the form will show an error.
> 5. Header: replace the "מאמרים" link with `<NavKnowledge articlesCount={ARTICLES.length} />`. In the mobile menu, replace "מאמרים" with an expandable "מאמרים ואירועים" item (same "+" behavior as the podcast item) using `MOBILE_KNOWLEDGE_SUB`. Footer, under "ידע": add "אירועים" → `/events` after "מאמרים".
> 6. Home page: render `<HomeEvents />` directly above the "המומלצים שלנו" section.
> 7. Empty state signup (`EmptyUpcoming` in `EventsIndex.tsx`): wire the TODO to save the email to a "notify about new events" list.
> 8. Fonts: Google Sans + Heebo, already loaded on the site.

## Admin (not included, for the backend)
Event fields: name, image, short description, full description, start and end date + time, location (online or address), free / paid, price, and status (draft / open / full / ended / cancelled). The admin needs a registrant list per event with CSV export, CSV import of customers, customer matching by phone or email, and "duplicate event".

## Notes
- The demo events, texts and the Tel Aviv address are placeholders. The images under `/assets/stage-*` and `/assets/research*` are temporary.
- Times are treated as Israel time (`Asia/Jerusalem`) in the calendar links.
