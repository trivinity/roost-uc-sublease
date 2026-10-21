# Google star ratings for property companies

A listing can name the property management company that runs the building. Students then see that company's live Google star rating and review count on the listing page.

## How it works

- On the post form, the optional **Property management company** field offers a quick-pick list (below) and a Google Maps search (Places API (New), Text Search). The listing saves only the company's **Place ID** (`listings.google_place_id`).
- The listing page asks `/api/places/rating` for the live rating (Place Details with only `rating`, `userRatingCount`, `googleMapsUri`) and shows "★ 4.8 (226 Google reviews)" with a **Google Maps** link.
- Both routes (`app/api/places/search`, `app/api/places/rating`) run on the server, so `GOOGLE_PLACES_API_KEY` never reaches the browser. Only signed-in students can call them (the route checks the Supabase session), with a per-user rate limit.
- The 20 sample listings keep their made-up ratings, now labeled as made-up (no "Google" wording).

## The quick-pick list

`public.property_groups` holds 12 entries, shown as chips on the post form:

| Property companies | Student apartment communities |
| --- | --- |
| Gaslight Property, Uptown Rental Properties, ES Properties, Premier City Properties, CP Cincy, Towne Properties | Yugo Cincinnati Deacon, University Edge, The Verge, Hub Cincinnati, Vanguard, U Square at the Loop |

How they were chosen (October 2026): Google Maps searches around campus (Clifton, Uptown, Corryville, Clifton Heights) ranked by number of Google reviews as a rough size signal, then checked against the companies' own sites and local coverage. Review counts range from about 100 to 900; this is a judgment call, not an official ranking. Gaslight Property says it has units across Clifton, Corryville and Clifton Heights ([its site](https://www.gaslightproperty.com/)), and Uptown Rental Properties has been active in the area for about 35 years ([Uptown Cincinnati](https://www.uptowncincinnati.com/blog/2024/4/24/a-snapshot-of-recent-and-upcoming-student-housing-developments-in-uptown)).

**Not included:** *Peak Property Group* has listings on UC's off-campus housing site (Vine St and W Clifton Ave) but no Google Maps business listing, so there is no rating to show. *The Gerdsen Co.* is on Google Maps but has no reviews yet. Names in the table are our own labels; only the Place IDs come from Google.

To add or remove entries (SQL editor):

```sql
insert into public.property_groups (name, kind, google_place_id, sort)
values ('Company name', 'company', 'PLACE_ID', 70);        -- kind: 'company' or 'community'
delete from public.property_groups where name = 'CP Cincy';
```

Find a Place ID with the company search on the post form (the ID is in the network response) or Google's [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).

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
