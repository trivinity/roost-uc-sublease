# Roost weekly checklist

Scratch items off at each check-in. Order follows the priorities agreed with Prof. Abuaitah: distance search, listing form, user preferences, then encryption and image size. Last updated 2026-10-21.

## Done

- [x] Distance from UC replaces fixed neighborhoods (computed from coordinates; filter: 1, 3, 5, 10, 20 mi or any)
- [x] Zillow-style map view (List / Map toggle on Browse)
- [x] Address lookup when posting a listing (free OpenStreetMap service, no Google key)
- [x] Nearest UC shuttle stop and Metro bus stop on every listing (**using sample stops**, see "Data we need")
- [x] Listing form: rent, terms, exact dates, utilities, furnished, room vs whole unit, lease transfer type (sublease, assignment, re-let)
- [x] Sublet fee: appears after the landlord-consent box, with a 0 to 100% "how much will you cover" slider and live dollar amounts
- [x] Amenity tags are icons with hover/tap labels
- [x] Property group name and Google review rating, labeled as Google reviews (sample data)
- [x] Open to faculty, staff and grad students (`@uc.edu` as well as `@mail.uc.edu`)
- [x] Roommate preferences: 6 rating scales + smoke-free and cat/dog checkboxes; users rate themselves too
- [x] Results ranked by roommate fit by default (not by newest), with a **Show all** toggle
- [x] Save, compare (side by side, includes sublet fee and fit) and report listing
- [x] Photo upload with automatic compression and thumbnails (done in the browser; web only so far)
- [x] Chat screen states the 30-day retention
- [x] Hosted on Vercel for testing: https://roost-uc-sublease.vercel.app
- [x] Phone app (Expo Go): same features except photo upload

## Next (in priority order)

1. [ ] **Shared backend (Supabase).** Today every browser has its own copy of the data, so testers can't see each other's listings or chats. Needs: tables for listings, profiles/preferences, chats, reports; row-level security; image storage
2. [ ] **Real sign-in without SSO:** one-time code emailed to a UC address (proves they own the inbox), restricted to `@mail.uc.edu` and `@uc.edu`
3. [ ] **Real chat** (Supabase realtime) with contact info hidden until shared
4. [ ] Move photo compression + thumbnails to the upload path (Storage) and add photo upload to the phone app
5. [ ] Replace sample shuttle and bus stops with real data
6. [ ] **Encryption decision and write-up** (see "Decisions"): HTTPS and at-rest encryption vs end-to-end
7. [ ] **30-day chat deletion** (scheduled job) and a legal retention answer from UC
8. [ ] Suggested message questions from a low-cost LLM (about $0.40 per 100 to 200 messages) with a daily spending cap
9. [ ] Test plan for students: announcement, tasks to try, feedback form, simple usage analytics
10. [ ] UC SSO (last, once approved by IT)

## Hardening before real students use it

- [ ] Rate limit and cache the address lookup (OpenStreetMap asks for 1 request per second; upgrade to Mapbox or Google if usage grows)
- [ ] Input validation and spam protection on posting and messaging
- [ ] Report queue and a way to take a listing down
- [ ] Privacy policy and terms (what is stored, for how long, who can see it)
- [ ] Accessibility pass (keyboard, screen reader, color contrast) and reduced motion
- [ ] Error monitoring and automated tests for the ranking, distance and fee math
- [ ] Custom date range in the phone filter sheet; remaining small phone gaps

## Data we need (from Prof. Abuaitah / UC)

- [ ] UC shuttle stops, routes and hours (TripShot; routes change every year, so preload each year's)
- [ ] Metro (SORTA) bus stops (published as GTFS) and the routes that serve campus
- [ ] Who at UC can answer: SSO approval, data policy for student data, chat retention (IT security, General Counsel)

## Decisions

- [ ] Chat privacy model: end-to-end (most private, but UC and moderators can't read reports and the LLM can't see messages) vs. encrypted in transit and at rest with 30-day server retention (supports safety review and legal requests)
- [ ] Distance: straight-line (what we use now) vs. driving or transit time
- [ ] Who sees a student's "About me" ratings, and whether hosts also state who they want as a roommate
- [ ] Roommate categories and wording (and a fairness check that nothing resembles a protected characteristic)
- [ ] What happens to unconfirmed listings (hide after N days?)
