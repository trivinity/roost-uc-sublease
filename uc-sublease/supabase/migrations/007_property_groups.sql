-- Quick-pick list of the big property companies and student apartment communities near UC. Only Google Place IDs are
-- stored (allowed indefinitely); names are our own labels and ratings are always fetched live.
alter table public.listings drop column property_group;

create table public.property_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('company', 'community')),
  google_place_id text not null unique check (google_place_id ~ '^[A-Za-z0-9_-]{10,200}$'),
  sort smallint not null default 100,
  created_at timestamptz not null default now()
);
alter table public.property_groups enable row level security;
create policy "signed-in students can read the list" on public.property_groups for select to authenticated using (true);
revoke all on public.property_groups from anon, authenticated;
grant select on public.property_groups to authenticated;

insert into public.property_groups (name, kind, google_place_id, sort) values
  ('Gaslight Property', 'company', 'ChIJP3LeqIezQYgRs8U5H0Yrlxo', 10),
  ('Uptown Rental Properties', 'company', 'ChIJMSFbuZWzQYgRcHJxNzFJDVk', 20),
  ('ES Properties', 'company', 'ChIJt8czi3a0QYgR6--Os4lUNNc', 30),
  ('Premier City Properties', 'company', 'ChIJ3beaPumzQYgR0Hia1Wwy5pY', 40),
  ('CP Cincy', 'company', 'ChIJ1cVtKMSzQYgRXBrOXH2EaKY', 50),
  ('Towne Properties', 'company', 'ChIJ6_fmWVexQYgRa1aUNVL2oX4', 60),
  ('Yugo Cincinnati Deacon', 'community', 'ChIJbe1dDMuxQYgRGi6Dq7ZCyzM', 10),
  ('University Edge', 'community', 'ChIJRbOo9o-zQYgRf60oENVCpjY', 20),
  ('The Verge', 'community', 'ChIJ3UMBQfOzQYgRIjyy3L6q53s', 30),
  ('Hub Cincinnati', 'community', 'ChIJNQzbQBGzQYgRytdeE1arM1U', 40),
  ('Vanguard', 'community', 'ChIJt5bd2X-zQYgRq43bYLqSwIg', 50),
  ('U Square at the Loop', 'community', 'ChIJiROmovSzQYgRW8dXuFwPY7Q', 60);
