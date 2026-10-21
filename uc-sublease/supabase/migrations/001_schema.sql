-- Roost schema. Every table has row level security (RLS): people can only read and write what the rules below allow.

-- ============================================================ profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  prefs jsonb,                              -- roommate preferences (rating scales and checkboxes)
  prefs_asked boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- People can only change these columns (not their email or id). Rows are created by the trigger below.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, prefs, prefs_asked, onboarded) on public.profiles to authenticated;

-- Only UC email addresses can create an account, and every new account gets a profile.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  local_part text := split_part(new.email, '@', 1);
begin
  if lower(coalesce(new.email, '')) !~ '^[^@\s]+@(mail\.)?uc\.edu$' then
    raise exception 'Only UC email addresses (@mail.uc.edu or @uc.edu) can join Roost.';
  end if;
  insert into public.profiles (id, email, display_name)
  values (new.id, lower(new.email), initcap(regexp_replace(local_part, '[._-]+', ' ', 'g')));
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================ listings
create table public.listings (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references public.profiles (id) on delete cascade,   -- null = sample listing
  is_sample boolean not null default false,
  title text not null check (char_length(title) between 3 and 120),
  address text not null check (char_length(address) between 3 and 200),
  area text not null default 'Near UC',
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  rent integer not null check (rent between 1 and 20000),
  utilities_included boolean not null,
  utilities_estimate integer not null default 0 check (utilities_estimate between 0 and 5000),
  start_date date not null,
  end_date date not null,
  bedrooms smallint not null check (bedrooms between 0 and 12),
  furnished boolean not null,
  unit_type text not null check (unit_type in ('room', 'whole')),
  transfer_type text not null check (transfer_type in ('sublease', 'assignment', 'relet')),
  description text not null default '' check (char_length(description) <= 4000),
  amenities text[] not null default '{}',
  sublet_fee integer not null default 0 check (sublet_fee between 0 and 20000),
  fee_split_pct smallint not null default 0 check (fee_split_pct between 0 and 100),
  household jsonb,                                                   -- roommates' ratings (rooms only)
  property_reviews jsonb,
  landlord_consent boolean not null check (landlord_consent),        -- cannot post without consent
  photos text[] not null default '{}' check (cardinality(photos) <= 8),   -- storage paths, or /photos/... for samples
  thumbs text[] not null default '{}' check (cardinality(thumbs) <= 8),
  host_name text not null default 'Host',
  host_detail text not null default 'UC verified',
  status text not null default 'active' check (status in ('active', 'rented', 'removed')),
  confirmed_at timestamptz not null default now(),                   -- when the host last said "still available"
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);
create index listings_status_idx on public.listings (status, confirmed_at desc);
create index listings_owner_idx on public.listings (owner_id);
alter table public.listings enable row level security;

create policy "read active listings or your own" on public.listings for select to authenticated
  using (status = 'active' or owner_id = (select auth.uid()));
create policy "post your own listing" on public.listings for insert to authenticated
  with check (owner_id = (select auth.uid()) and is_sample = false);
create policy "edit your own listing" on public.listings for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and is_sample = false);
create policy "delete your own listing" on public.listings for delete to authenticated
  using (owner_id = (select auth.uid()));

revoke all on public.listings from anon, authenticated;
grant select, insert, update, delete on public.listings to authenticated;

-- Fills in the host's name from their profile (so it can't be faked) and caps active listings per person.
create function public.listings_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
begin
  if new.owner_id is not null then
    select * into p from public.profiles where id = new.owner_id;
    new.host_name := p.display_name;
    new.host_detail := 'UC verified';
    if (select count(*) from public.listings where owner_id = new.owner_id and status = 'active') >= 20 then
      raise exception 'You already have 20 active listings. Mark one as rented first.';
    end if;
  end if;
  new.confirmed_at := now();
  return new;
end $$;
revoke execute on function public.listings_before_insert() from public, anon, authenticated;
create trigger listings_before_insert before insert on public.listings
  for each row execute function public.listings_before_insert();

-- ============================================================ shortlist
create table public.shortlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id text not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.shortlist enable row level security;
create policy "manage your own shortlist" on public.shortlist for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.shortlist from anon, authenticated;
grant select, insert, delete on public.shortlist to authenticated;

-- ============================================================ chats
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references public.listings (id) on delete cascade,
  listing_title text not null,
  seeker_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid references public.profiles (id) on delete cascade,     -- null for sample listings
  seeker_name text not null,
  host_name text not null,
  seeker_shared boolean not null default false,                       -- has the student shared their contact info?
  host_shared boolean not null default false,
  seeker_read_at timestamptz not null default now(),
  host_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, seeker_id)
);
create index threads_seeker_idx on public.threads (seeker_id);
create index threads_host_idx on public.threads (host_id);
alter table public.threads enable row level security;

create table public.messages (
  id bigint generated always as identity primary key,
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,  -- null for system and sample-host messages
  kind text not null default 'user' check (kind in ('user', 'system', 'sample_host')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_thread_idx on public.messages (thread_id, created_at);
alter table public.messages enable row level security;

create function public.is_thread_member(tid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.threads t
    where t.id = tid and (t.seeker_id = (select auth.uid()) or t.host_id = (select auth.uid()))
  );
$$;
revoke execute on function public.is_thread_member(uuid) from public, anon;
grant execute on function public.is_thread_member(uuid) to authenticated;

create policy "read your chats" on public.threads for select to authenticated
  using (seeker_id = (select auth.uid()) or host_id = (select auth.uid()));
create policy "start a chat as the student" on public.threads for insert to authenticated
  with check (seeker_id = (select auth.uid()));
create policy "read messages in your chats" on public.messages for select to authenticated
  using (public.is_thread_member(thread_id));
create policy "send messages in your chats" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and kind = 'user' and public.is_thread_member(thread_id));

revoke all on public.threads, public.messages from anon, authenticated;
grant select, insert on public.threads to authenticated;
grant select, insert on public.messages to authenticated;
-- No update or delete for anyone: contact sharing and read marks go through the functions below, and
-- old messages are removed by the 30-day cleanup job.

-- Copies names and the host from the listing so they can't be faked, and blocks messaging yourself.
create function public.threads_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  l public.listings;
  me public.profiles;
begin
  select * into l from public.listings where id = new.listing_id;
  if not found or l.status <> 'active' then
    raise exception 'That listing is no longer available.';
  end if;
  if l.owner_id is not null and l.owner_id = new.seeker_id then
    raise exception 'This is your own listing.';
  end if;
  select * into me from public.profiles where id = new.seeker_id;
  new.host_id := l.owner_id;
  new.host_name := l.host_name;
  new.listing_title := l.title;
  new.seeker_name := me.display_name;
  new.seeker_shared := false;
  new.host_shared := false;
  return new;
end $$;
revoke execute on function public.threads_before_insert() from public, anon, authenticated;
create trigger threads_before_insert before insert on public.threads
  for each row execute function public.threads_before_insert();

-- Sample listings have no real owner, so they answer automatically (clearly marked in the app).
create function public.sample_host_reply() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  t public.threads;
  replies text[] := array[
    'Sounds good! When are you free to tour?',
    'Yep, still available. I can show it over video if you''re not in town.',
    'Happy to answer anything. The landlord already signed off on the sublease.',
    'Great question. I''ll send photos of that tonight.'
  ];
begin
  select * into t from public.threads where id = new.thread_id;
  if t.host_id is null and new.kind = 'user' then
    insert into public.messages (thread_id, sender_id, kind, body)
    values (new.thread_id, null, 'sample_host', replies[1 + (new.id % 4)::int]);
  end if;
  return null;
end $$;
revoke execute on function public.sample_host_reply() from public, anon, authenticated;
create trigger sample_host_reply after insert on public.messages
  for each row execute function public.sample_host_reply();

-- Share your own contact info in a chat. Sample hosts "share back" automatically.
create function public.share_contact(p_thread uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  t public.threads;
  me uuid := (select auth.uid());
begin
  select * into t from public.threads where id = p_thread and (seeker_id = me or host_id = me);
  if not found then raise exception 'Chat not found.'; end if;
  if t.seeker_id = me then
    update public.threads set seeker_shared = true where id = p_thread;
    insert into public.messages (thread_id, sender_id, kind, body)
      values (p_thread, null, 'system', t.seeker_name || ' shared their contact info.');
    if t.host_id is null then
      update public.threads set host_shared = true where id = p_thread;
      insert into public.messages (thread_id, sender_id, kind, body)
        values (p_thread, null, 'system', t.host_name || ' shared their contact info too.');
    end if;
  else
    update public.threads set host_shared = true where id = p_thread;
    insert into public.messages (thread_id, sender_id, kind, body)
      values (p_thread, null, 'system', t.host_name || ' shared their contact info.');
  end if;
end $$;
revoke execute on function public.share_contact(uuid) from public, anon;
grant execute on function public.share_contact(uuid) to authenticated;

-- The other person's contact info, only after they chose to share it.
create function public.get_contact(p_thread uuid) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  t public.threads;
  me uuid := (select auth.uid());
  other_email text;
begin
  select * into t from public.threads where id = p_thread and (seeker_id = me or host_id = me);
  if not found then return null; end if;
  if t.seeker_id = me then
    if not t.host_shared then return null; end if;
    if t.host_id is null then
      return lower(split_part(t.host_name, ' ', 1)) || '@mail.uc.edu (sample listing)';
    end if;
    select email into other_email from public.profiles where id = t.host_id;
  else
    if not t.seeker_shared then return null; end if;
    select email into other_email from public.profiles where id = t.seeker_id;
  end if;
  return other_email;
end $$;
revoke execute on function public.get_contact(uuid) from public, anon;
grant execute on function public.get_contact(uuid) to authenticated;

create function public.mark_thread_read(p_thread uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
begin
  update public.threads set seeker_read_at = now() where id = p_thread and seeker_id = me;
  update public.threads set host_read_at = now() where id = p_thread and host_id = me;
end $$;
revoke execute on function public.mark_thread_read(uuid) from public, anon;
grant execute on function public.mark_thread_read(uuid) to authenticated;

-- ============================================================ reports
create table public.reports (
  id bigint generated always as identity primary key,
  listing_id text not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 200),
  created_at timestamptz not null default now(),
  unique (listing_id, reporter_id)
);
alter table public.reports enable row level security;
create policy "file and see your own reports" on public.reports for all to authenticated
  using (reporter_id = (select auth.uid())) with check (reporter_id = (select auth.uid()));
revoke all on public.reports from anon, authenticated;
grant select, insert on public.reports to authenticated;
