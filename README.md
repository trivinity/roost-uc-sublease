# Roost: verified student sublease marketplace (UC capstone demo)

A clickable prototype for a senior design capstone: a swipe-based sublease marketplace for University of Cincinnati students. All data is fake and there is no backend.

| Folder | What it is |
| --- | --- |
| [`uc-sublease/`](uc-sublease) | The web app (Next.js App Router, TypeScript, Tailwind). See its README for screens, structure and the `RIGHT_SWIPE_ACTION` switch. |
| [`roost-mobile/`](roost-mobile) | The native phone app (Expo / React Native). Test it on your phone with the Expo Go app. See its README. |
| [`roost-video/`](roost-video) | The motion-graphics promo, built with [Remotion](https://www.remotion.dev). The finished video is `roost-video/out/roost-promo.mp4`. |

## Live demo

**https://roost-uc-sublease.vercel.app** (the web app, hosted on Vercel). Sign in with any `@mail.uc.edu` email and the demo code `123456`. Data is fake and is saved only in your own browser.

Pushing to `main` redeploys it automatically (Vercel project root is `uc-sublease/`).

## Run the app

```bash
cd uc-sublease
npm install
npm run dev        # http://localhost:3000
```

Sign in with any `@mail.uc.edu` email and the demo code `123456`.

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
