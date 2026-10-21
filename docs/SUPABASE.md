# Roost backend (Supabase)

The web app keeps all shared data in one Supabase project, so testers see each other's listings and chats.

| | |
| --- | --- |
| Project | `roost-uc-sublease` (ref `mmstaaloraytgixubhip`, region us-east-2, Free plan) |
| API URL | `https://mmstaaloraytgixubhip.supabase.co` |
| Schema | [`uc-sublease/supabase/migrations/`](../uc-sublease/supabase/migrations), applied in order |
| App settings | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `uc-sublease/.env.example`). Both are public by design; the database rules below are what protect the data. Never put the `service_role` or secret key in the app. |

## What is stored

| Table | Holds | Who can see it |
| --- | --- | --- |
| `profiles` | email, display name, roommate preferences, onboarding flags | only that student |
| `listings` | the 20 sample listings plus everything students post | any signed-in student sees active listings; owners also see and edit their own |
| `shortlist` | saved listings | only that student |
| `threads`, `messages` | chats (30-day retention) | only the two people in the chat |
| `reports` | listing reports | only the reporter (staff read them in the SQL editor) |
| `email_allowlist` | non-UC emails allowed to sign in (staff, advisors, testers) | nobody through the API |
| Storage bucket `listing-photos` | compressed full-size and thumbnail photos | public to view (the photos are the ad); only the owner can upload into their own folder |

## The rules, in plain words (all enforced inside the database)

- **Only UC people can have an account.** A database trigger rejects every sign-up that is not `@mail.uc.edu` or `@uc.edu` (or on `email_allowlist`). It runs before any email is sent, so strangers never receive codes.
- **You can only change your own stuff.** Listings, shortlist, profile and reports are row-level-secured to their owner. Nobody can post as someone else, edit or delete someone else's listing, or turn a listing into a "sample".
- **Landlord consent is required** to post (a database check, not just a checkbox in the page).
- **The server fills in names.** Host name, chat names and listing titles are copied from the profile and listing by triggers, so they can't be faked from the browser.
- **Chats are private.** Only the two participants can read or write them. Nobody can edit or delete a message. System messages ("shared contact info") can't be forged.
- **Contact info stays hidden until each side shares.** `get_contact` returns the other person's email only after they pressed "Share".
- **Chats are deleted after 30 days** by a nightly job (`roost-delete-old-chats`, 03:17 UTC).
- **Sample listings answer automatically.** Messaging a sample listing gets a canned reply, and the app marks these listings "Sample". Posts by real students are never auto-answered.

The security advisor also notes that `email_allowlist` has row-level security on but no policies: that is deliberate, it makes the table invisible to the API. It reports three intentional warnings: `get_contact`, `share_contact`, `mark_thread_read` can be called by signed-in students. They only act on the caller's own chats.

## Do these once in the Supabase dashboard

These settings are not reachable from code, so they need you (project → **Authentication**):

1. **Email templates with a code.** Templates → edit **both** *Confirm sign up* and *Magic link*. A student's first sign-in is a sign-up, so it uses *Confirm sign up* ([Supabase discussion](https://github.com/orgs/supabase/discussions/28947)); later sign-ins use *Magic link*. Replace the body of each so it shows the code (the app asks for a 6-digit code):
   ```html
   <h2>Your Roost code</h2>
   <p>Enter this code to sign in: <strong>{{ .Token }}</strong></p>
   <p>It expires soon. If you didn't ask for it, ignore this email.</p>
   ```
   Also set the subject to `Your Roost code`.
2. **Custom SMTP (required before real students sign in).** Settings → SMTP. Supabase's built-in email service **only delivers to people on your Supabase organization's team** and is rate limited, so without this, students never get a code ([docs](https://supabase.com/docs/guides/auth/auth-smtp)). Use Resend, Postmark, SendGrid or AWS SES with a sender on a domain you control (Resend's test sender only emails your own account until you verify a domain). With no domain yet, a Gmail address with an [app password](https://myaccount.google.com/apppasswords) works for a class test (host `smtp.gmail.com`, port 465, about 500 emails a day). Then raise Rate Limits → "Sign-ups and sign-ins" if you expect a class announcement (the default with custom SMTP is 30 new users per hour, per the [production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)).
3. **URL configuration.** Site URL `https://roost-uc-sublease.vercel.app`; add Redirect URLs `https://roost-uc-sublease.vercel.app/**` and `http://localhost:3000/**`.
4. **Before launch:** upgrade to Pro. Free projects are paused after about 7 days without activity, and Pro adds daily backups. Turn on SSL enforcement under Database → Settings.

## Letting in someone without a UC email (advisor, teammates)

Run in the SQL editor, then they request a code as usual:

```sql
insert into public.email_allowlist (email, note) values ('advisor@example.com', 'advisor');
```

Until custom SMTP is set up, the built-in email service also needs that person added as a member of your Supabase organization.

## Everyday operations (SQL editor)

```sql
-- hide or remove the made-up sample listings once real ones exist
update public.listings set status = 'removed' where is_sample;   -- hide (reversible)
delete from public.listings where is_sample;                      -- remove for good

-- review reports
select r.created_at, r.reason, l.title, l.address, p.email as reported_by
from public.reports r join public.listings l on l.id = r.listing_id join public.profiles p on p.id = r.reporter_id
order by r.created_at desc;

-- take a listing down
update public.listings set status = 'removed' where id = '...';

-- remove a student (cascades to their listings, chats and shortlist)
delete from auth.users where email = '...';
```

## Are Supabase chats end-to-end encrypted?

**No.** Supabase does not offer a chat product or end-to-end encryption. It gives you the building blocks (Postgres, Realtime, Storage, Auth) and chat is built on top, which is what Roost does.

What chats do have today:

- **In transit:** the APIs, including Realtime, accept only HTTPS, TLS 1.2 or 1.3 ([TLS docs](https://supabase.com/docs/guides/security/tls)).
- **At rest:** Supabase states customer data is encrypted at rest with AES-256 and in transit with TLS ([supabase.com/security](https://supabase.com/security)).
- **Access control:** Realtime delivers a row only to people allowed to read it under the row-level-security rules ([Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)). A student cannot read someone else's chat through the API.

What this means: whoever runs the project (you, and Supabase staff in extreme cases such as a legal order) *can* read messages in the database. That is the usual setup for marketplaces, and it is what lets you handle safety reports, legal requests and the 30-day deletion.

Making it end-to-end would mean encrypting in the browser with keys only the two students hold, so the server stores unreadable text. The cost: you can no longer read a reported chat, can't run the LLM message suggestions on content, lose server-side search, and need a key-recovery story when a student loses their phone. It is a real engineering project (for example the Signal protocol or libsodium sealed boxes), not a setting. **Recommendation:** ship with transit + at-rest encryption + 30-day retention now, tell students plainly that "Roost staff can review reported chats", and revisit E2EE only if UC or the advisor requires it. This is the decision to bring to Prof. Abuaitah.

## Not done yet

- **Phone app** still runs on local demo data. It needs the same data layer (`@supabase/supabase-js` with AsyncStorage for the session, and photo upload to Storage).
- **Photo cleanup:** deleting a listing leaves its photos in Storage. A small scheduled function can remove files no listing references.
- **Bot protection on the code request.** It is the one endpoint anyone on the internet can call. Turn on CAPTCHA (Auth → Attack Protection, Cloudflare Turnstile is free) *together with* a Turnstile widget on the sign-in page that passes `captchaToken` to `signInWithOtp`; enabling it in the dashboard alone would block every sign-in.
- **Rate limits on posting and messaging** (the database caps 20 active listings per student; message flooding is not limited yet).
- **Admin screen** for reports (today: SQL editor).
- **LLM message suggestions** (needs a server route and a spending cap).
- **Automated tests** for the database rules. The rules were checked once with a scripted test (26 cases, rolled back); worth turning into a repeatable test.
