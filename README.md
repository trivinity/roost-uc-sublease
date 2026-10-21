# Roost: verified student sublease marketplace (UC capstone demo)

A senior design capstone: a swipe-based sublease marketplace for University of Cincinnati students. The web app runs on a Supabase backend (accounts, listings, photos, real-time chat). The sample listings are made up.

| Folder | What it is |
| --- | --- |
| [`uc-sublease/`](uc-sublease) | The web app (Next.js App Router, TypeScript, Tailwind). See its README for screens, structure and the `RIGHT_SWIPE_ACTION` switch. |
| [`roost-mobile/`](roost-mobile) | The native phone app (Expo / React Native). Test it on your phone with the Expo Go app. See its README. |
| [`roost-video/`](roost-video) | The motion-graphics promo, built with [Remotion](https://www.remotion.dev). The finished video is `roost-video/out/roost-promo.mp4`. |

## Docs

- [`docs/SUPABASE.md`](docs/SUPABASE.md): the backend, its security rules, the one-time dashboard setup, and the encryption answer
- [`docs/CHECKLIST.md`](docs/CHECKLIST.md): weekly checklist for advisor check-ins
- [`docs/advisor-meeting-2026-10-21.md`](docs/advisor-meeting-2026-10-21.md): status and talking points

## Live demo

**https://roost-uc-sublease.vercel.app** (the web app, hosted on Vercel; project root is `uc-sublease/`). Students sign in with a UC email and a one-time code emailed to them. Finish the email setup in [`docs/SUPABASE.md`](docs/SUPABASE.md) first, or nobody can receive a code.

## Run the app

```bash
cd uc-sublease
cp .env.example .env.local   # then fill in the two Supabase values
npm install
npm run dev        # http://localhost:3000
```

Sign in with a UC email; the code arrives by email. To let a non-UC address in for testing, see "Letting in someone without a UC email" in [`docs/SUPABASE.md`](docs/SUPABASE.md). The phone app (`roost-mobile/`) still uses local demo data (code `123456`).

## Run the phone app

```bash
cd roost-mobile
npm install
npx expo start     # scan the QR code with Expo Go
```

## Render the video

```bash
cd roost-video
npm install
npm run studio     # live preview
npm run render     # writes out/roost-promo.mp4
node make-audio.mjs   # regenerates public/music.wav (synthesized, 120 BPM)
```

## Credits and licenses

- UI details from [Rare UI](https://www.rareui.com) (OTP input, notification bell). Its license requires a visible credit, which the app shows.
- Listing photos are free Unsplash images used as demo placeholders. They are not the actual units.
- Remotion is free for individuals and small teams; check its license for commercial use.
