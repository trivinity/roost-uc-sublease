-- Staff, advisors and testers without a UC address can be let in by adding their email here (SQL editor only; the API cannot see this table).
create table public.email_allowlist (
  email text primary key check (email = lower(email)),
  note text,
  created_at timestamptz not null default now()
);
alter table public.email_allowlist enable row level security;
revoke all on public.email_allowlist from anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  local_part text := split_part(new.email, '@', 1);
  addr text := lower(coalesce(new.email, ''));
begin
  if addr !~ '^[^@\s]+@(mail\.)?uc\.edu$'
     and not exists (select 1 from public.email_allowlist a where a.email = addr) then
    raise exception 'Only UC email addresses (@mail.uc.edu or @uc.edu) can join Roost.';
  end if;
  insert into public.profiles (id, email, display_name)
  values (new.id, addr, initcap(regexp_replace(local_part, '[._-]+', ' ', 'g')));
  return new;
end $$;
