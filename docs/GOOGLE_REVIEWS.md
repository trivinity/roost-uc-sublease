# Google star ratings for property companies

A listing can name the property management company that runs the building. Students then see that company's live Google star rating and review count on the listing page.

## How it works

- On the post form, the optional **Property management company** field searches Google Maps (Places API (New), Text Search) and saves the company's **Place ID** and name on the listing (`listings.google_place_id`, `listings.property_group`).
- The listing page asks `/api/places/rating` for the live rating (Place Details with only `rating`, `userRatingCount`, `googleMapsUri`) and shows "★ 4.8 (226 Google reviews)" with a **Google Maps** link.
- Both routes (`app/api/places/search`, `app/api/places/rating`) run on the server, so `GOOGLE_PLACES_API_KEY` never reaches the browser. Only signed-in students can call them (the route checks the Supabase session), with a per-user rate limit.
- The 20 sample listings keep their made-up ratings, now labeled as made-up (no "Google" wording).

## Google's rules we follow

Source: [Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies).

- **No storing or caching Places content** except the Place ID, which may be kept indefinitely. So the rating is fetched on view, never saved, and the routes send `Cache-Control: no-store`.
- **Attribution:** the rating shows "Google Maps" text linking to the place on Google Maps, inside a bordered card so it is visibly Google content.
- Review text is deliberately not used (it needs author credit on every review and costs more).

## Cost

Rating and count are in the **Place Details Enterprise** SKU: 1,000 free calls a month, then $20 per 1,000. The company search is Text Search Pro: 5,000 free a month, then $32 per 1,000 ([pricing](https://developers.google.com/maps/billing-and-pricing/pricing)). One listing view with a company set is one rating call.

## Setup checklist

1. Google Cloud project with billing and **Places API (New)** enabled.
2. API key restricted to **Places API (New)** only (API restriction). It can't be IP- or referrer-restricted because it is called from Vercel servers, so keep it server-side only.
3. In Google Cloud, set a **quota cap** for Place Details and Text Search (for example 100 per day) and a **budget alert**.
4. Put the key in `uc-sublease/.env.local` and in Vercel as `GOOGLE_PLACES_API_KEY`.
5. If a key was ever pasted in chat or committed, regenerate it after the demo.
