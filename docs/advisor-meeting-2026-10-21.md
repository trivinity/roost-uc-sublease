# Advisor meeting prep: 2026-10-21

## One-minute summary

Everything Prof. Abuaitah asked for in the first-priority areas is built and live: distance search with a map, the improved listing form with sublet fee splitting, icon amenities, and roommate preferences that rank results (with a Show all toggle). Photo upload compresses and makes thumbnails automatically. What is not done is everything that needs a **shared backend** (Supabase), real sign-in, real chat, and real transit data. Right now each browser keeps its own data, so students can try the app but cannot see each other's listings or messages yet.

Live demo: https://roost-uc-sublease.vercel.app (sign in with any `@uc.edu` or `@mail.uc.edu` email, code `123456`).

## What changed since the last meeting

| You asked for | Status |
| --- | --- |
| Distance from UC instead of neighborhoods (10 or 20 miles) | Done: filter chips 1, 3, 5, 10, 20 mi, computed from coordinates |
| Zillow-style map | Done on web and phone (phone map untested on a device) |
| Distance measured from UC automatically when someone enters an address | Done: address lookup, no Google key needed |
| Nearest bus stop and UC shuttle stop | Done in the app; **stop data is sample data** until you send the real stops |
| Sublet fee after landlord consent, with a split slider and live dollar amounts | Done |
| Amenity tags as icons with hover text | Done |
| Property group Google reviews, labeled as Google | Done (sample data) |
| Open to faculty, staff, grad students | Done at sign-in (`@uc.edu`); no family/housing-type fields yet |
| Roommate info as checkboxes and rating scales, users rate themselves | Done: 6 scales, smoke-free and cat/dog checkboxes |
| Rank by onboarding preferences with Show all, not by recency | Done |
| Auto compression and thumbnails for uploaded images | Done in the browser (web). Phone upload still to do |
| Chats kept 30 days | Stated in the chat screen; actual deletion needs the backend |
| Weekly checklist | `docs/CHECKLIST.md` |

## Demo script (about 5 minutes)

1. Sign in with a faculty-style `@uc.edu` address, then the roommate preference questions (about a minute).
2. Discover: match percentage, icon amenities, distance pill. Open the details panel (nearest shuttle and bus stop, roommates, sublet fee).
3. Filters: pick 5 mi. Browse, switch to Map.
4. Tap **Show all** to show what the ranking hides.
5. Post a listing: add a big photo (watch it shrink), type an address (distance appears), tick landlord consent, enter a fee and move the split slider.
6. Save two listings and compare (fee and roommate fit rows).
7. Show the phone app in Expo Go.

## Questions and decisions to bring

1. **Backend ownership.** OK to create the Supabase project now? Whose account and billing (free tier at first)? Any UC rules about storing student data before a production approval?
2. **Sign-in until SSO.** A one-time code to a UC email address proves inbox ownership without IT. Is that acceptable for class testing instead of dummy passwords?
3. **Chat privacy.** True end-to-end encryption conflicts with 30-day server retention, safety review, the LLM suggestions and legal requests. Which do we prioritize? Who at UC (IT security or General Counsel) sets the retention rule?
4. **Transit data.** Who owns the shuttle (TripShot) data and can they share stops and routes? Metro publishes its stops publicly; should we use that?
5. **Distance meaning.** Straight-line miles (current) or driving time? Max radius?
6. **Roommate ratings.** Are the six categories and wording right? Should hosts also say who they want? Do we need a review for housing-fairness rules?
7. **LLM suggestions.** What text may be sent to an outside LLM, and what monthly spending cap?
8. **Landlord consent.** Honor system today. Do we want proof (lease clause upload) or just a checkbox for now?
9. **Testing plan.** Date to announce in class, how many testers, tasks to try, a feedback form, and what success looks like.
10. **Timeline.** Which items are must-have for the class test vs. for the final.

## Suggested plan for the next two weeks

**Week 1:** Supabase project (profiles, listings, preferences, chats, reports), row-level security, email-code sign-in, image storage with compression + thumbnails, move the app from local data to the shared backend.

**Week 2:** Real-time chat with contact info hidden until shared, 30-day deletion job, real transit data, feedback form and analytics, a testing session with a few classmates before announcing it to the class.

## Risks worth naming

- Until the backend exists, testers see only their own data. Announce it to the class after Week 1, not before.
- The address and map services we use are free and rate-limited. Fine for a class test; swap to a paid tier for production.
- Roommate preference data is personal. Decide who can see it before storing real answers.
- Property Google reviews: using Google's data programmatically has its own terms; sample data only for now.
