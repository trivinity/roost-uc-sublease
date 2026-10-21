# Roost: verified student sublease marketplace (UC demo)

A senior design capstone. Next.js (App Router) + TypeScript + Tailwind on a **Supabase** backend: email-code sign-in restricted to UC addresses, shared listings with photo storage, real-time chat, and row-level security on every table. The 20 sample listings are made up (they carry a "Sample" badge and answer automatically). Details, setup steps and the encryption answer: [`../docs/SUPABASE.md`](../docs/SUPABASE.md).

## Run it

```bash
cp .env.example .env.local    # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
```

Sign in with a UC address; a code is emailed to it.

**Try every screen without an account:** `NEXT_PUBLIC_MOCK_BACKEND=1 npm run dev` swaps in an in-memory fake backend (sample listings, two chats, two of your own listings). Sign in with any `@mail.uc.edu` address and the code `123456`. It exists only for local UI testing (`lib/supabase/mock.ts`) and is left out of normal builds. Per-device settings (filters, cards you already swiped) are kept in localStorage key `roost-ui-v3`; everything else lives in Supabase.

## The one-line switch

`RIGHT_SWIPE_ACTION` lives in [`lib/config.ts`](lib/config.ts):

```ts
export const RIGHT_SWIPE_ACTION: RightSwipeAction = "message"; // or "shortlist"
```

- `"message"` (default): swipe right / right button / `→` opens a chat with the sublessor (first message pre-drafted).
- `"shortlist"`: the same gestures save the listing instead.

The button label, swipe stamp and behavior all follow the constant. The shortlist is also reachable in both modes through the bookmark icon on every card, row and detail page, and messaging is always available from the detail page.

## Screens

| Route | What it is |
| --- | --- |
| `/signin` | Email a one-time code to a `@mail.uc.edu` / `@uc.edu` address, then enter the 6 digits |
| `/` | Swipe deck (drag, buttons, or ← → keys; undo last swipe) |
| `/list` | Same listings as a list. Shares **one** filter state with the deck |
| `/shortlist` | Saved listings; tick 2–3 to compare side by side |
| `/listing/[id]` | Photos, structured fields, "still available?" freshness label, report |
| `/mine` | My listings: re-confirm "still available" or mark as rented |
| `/post` | Post a listing; the subletting/landlord-consent checkbox is required |
| `/messages`, `/messages/[id]` | Real-time chats (kept 30 days). Contact info stays hidden until each side chooses to share |

Filters (distance from UC, rent range, dates with Spring/Summer/Fall presets, bedrooms, furnished) are opened from the Filters button on `/` and `/list`. The date filter matches listings that cover your **whole** range. Term dates are in `lib/filters.ts`.

## Folder structure

```
app/                 routes (one page.tsx per screen)
public/photos/       demo listing photos (Unsplash)
components/
  ui/                shadcn button + Rare UI components (otp-input, notification-bell)
  swipe-deck.tsx     deck, drag/keyboard handling, RIGHT_SWIPE_ACTION wiring
  filter-button.tsx  filter button + sheet
  listing-card.tsx   deck card face      listing-row.tsx  list row
  compare-table.tsx  shortlist comparison
  messages-view.tsx  thread list + chat + contact-sharing panel
  report-dialog.tsx  sheet.tsx  chip.tsx  pill.tsx  save-button.tsx  photo.tsx  app-shell.tsx
lib/
  config.ts          RIGHT_SWIPE_ACTION, demo code, email pattern
  listings.ts        the 20 sample listings (source of the database seed; the phone app's offline demo still imports it)
  store.tsx          all app state: Supabase data, auth, live chat, plus per-device UI settings
  supabase/          client, generated database types, row-to-app mappers
  filters.ts         filter defaults, term presets, filterListings()
  format.ts          dates, money, labels, freshness
  types.ts
```

## Notes

- **Rare UI**: the site's library is a set of unusual animated components, not general cards/buttons/modals, so only the ones that fit are used: `otp-input` (sign-in code) and `notification-bell` (unread messages). They were added with `npx shadcn@latest add swamimalode07/rare-ui/<name>`. Their license requires a visible credit, so there is a "Rare UI" link at the bottom of several screens and here: <https://www.rareui.com>.
- Everything else uses plain Tailwind plus the shadcn `button` and Base UI `dialog` (for the filter and report sheets).
- Photos are free Unsplash interior shots saved in `public/photos/` (6 living rooms, 6 bedrooms, 6 kitchens) and mixed across the 15 listings in `lib/listings.ts`. They are demo images, not the actual units. Swap in real ones by editing each listing's `photos` array.
- Dark mode: follows the system by default; the sun/moon button in the header (and the Light/Dark/Auto picker in the avatar menu) overrides it and is remembered. Dark surfaces are a warm charcoal (about #161312, not pure black) that get lighter as they rise, with off-white text and a lighter red for text, following Material Design's dark-theme guidance. Tokens live in the `.dark` block of `app/globals.css`.
- Premium touches: layered shadows and glass header, photo shimmer + fade-in, sliding nav indicator, save "pop" and phone haptics, price insight ("12% below average", `lib/insights.ts`), sticky action bar on phone detail pages, branded sign-in. Motion respects `prefers-reduced-motion`.
- Responsive layout: phones get a single column with a bottom tab bar; tablets get a larger deck card; wide screens (1024px+) add a details panel beside the deck and a live preview on the post form.
- Welcome slides: shown once after the first sign-in (`components/welcome.tsx`). Reset by clearing the `onboarded` flag in localStorage key `roost-demo-v1`.
- Photo expand transition: tapping a deck card or list row morphs its photo into the detail page using the View Transitions API (`lib/transition.ts`). Browsers without it, or with reduced motion on, navigate normally.
- Copy: every toast, form error and empty state lives in `lib/copy.ts` so the voice stays consistent.
- Theme: warm background with a red accent (`--primary` in `app/globals.css`) and one soft color per neighborhood (`HOOD_STYLE` in `lib/format.ts`).
- Out of scope by design: payments/escrow, protected-characteristic filters, UC single sign-on (deferred until UC IT approves it).

## Distance, map and nearby stops

- Every listing has coordinates (`lat`/`lng`). Distance is the straight-line miles from the UC campus center (`UC_CENTER` in `lib/geo.ts`) and is always computed, never typed.
- When posting, the address is looked up through `app/api/geocode/route.ts` (OpenStreetMap Nominatim, free, no API key). Swap that one file for Google or Mapbox if you want autocomplete.
- Browse has a List / Map toggle (Leaflet with OpenStreetMap tiles, no key).
- **Nearby stops are sample data.** Replace `SHUTTLE_STOPS` and `BUS_STOPS` in `lib/transit.ts` with the real UC shuttle (TripShot) and Metro stops; nothing else changes.

## Roommates, amenities and fees

- Roommate preferences use rating scales and checkboxes only (`lib/roommates.ts`). Students set them after the welcome slides (and later at `/preferences`); each room listing carries its household's ratings. `lib/ranking.ts` ranks by fit and hides poor fits until **Show all**.
- Amenities are icon-only chips with a hover/tap label (`components/amenity-icons.tsx`, labels in `lib/amenities.ts`).
- The sublet fee and who pays what is set on the post form after the landlord-consent box is ticked, and shows on listings and in compare.
