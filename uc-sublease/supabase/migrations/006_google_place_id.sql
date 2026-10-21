-- A listing can point at the property management company's Google listing. We store only the Place ID (Google allows
-- keeping that indefinitely); ratings are fetched live and never stored.
alter table public.listings
  add column google_place_id text check (google_place_id ~ '^[A-Za-z0-9_-]{10,200}$'),
  add column property_group text check (char_length(property_group) <= 120);
