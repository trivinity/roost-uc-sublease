-- Sample listings keep their own "last confirmed" date; real ones start fresh.
create or replace function public.listings_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
begin
  if new.owner_id is not null then
    select * into p from public.profiles where id = new.owner_id;
    new.host_name := p.display_name;
    new.host_detail := 'UC verified';
    new.confirmed_at := now();
    if (select count(*) from public.listings where owner_id = new.owner_id and status = 'active') >= 20 then
      raise exception 'You already have 20 active listings. Mark one as rented first.';
    end if;
  end if;
  return new;
end $$;

-- ============================================================ photo storage
-- Listing photos are public to view (they are the ad), but only the owner can upload into their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 2097152, array['image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/webp', 'image/png'];

create policy "upload photos to your own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "remove your own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============================================================ realtime chat
-- postgres_changes respects the row level security rules above, so people only receive their own chats.
alter publication supabase_realtime add table public.messages, public.threads;

-- ============================================================ 30-day chat retention
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'roost-delete-old-chats',
  '17 3 * * *',
  $$
    delete from public.messages where created_at < now() - interval '30 days';
    delete from public.threads t
      where t.created_at < now() - interval '30 days'
        and not exists (select 1 from public.messages m where m.thread_id = t.id);
  $$
);
