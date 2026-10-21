-- The membership check is only used inside row level security rules, so it moves to a schema the public API cannot reach.
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.is_thread_member(tid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.threads t
    where t.id = tid and (t.seeker_id = (select auth.uid()) or t.host_id = (select auth.uid()))
  );
$$;
revoke execute on function private.is_thread_member(uuid) from public, anon;
grant execute on function private.is_thread_member(uuid) to authenticated;

drop policy "read messages in your chats" on public.messages;
drop policy "send messages in your chats" on public.messages;
create policy "read messages in your chats" on public.messages for select to authenticated
  using (private.is_thread_member(thread_id));
create policy "send messages in your chats" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and kind = 'user' and private.is_thread_member(thread_id));
drop function public.is_thread_member(uuid);

create index messages_sender_idx on public.messages (sender_id);
create index reports_reporter_idx on public.reports (reporter_id);
create index shortlist_listing_idx on public.shortlist (listing_id);
