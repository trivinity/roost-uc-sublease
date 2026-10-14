# Roost mobile (Expo / React Native)

The native phone version of the Roost demo. It reuses the same fake listings, filters, wording and photos as the web app, with native screens, real swipe gestures, haptics and a bottom tab bar. No backend: everything is stored on the device with AsyncStorage.

## Try it on your phone (Expo Go)

1. Install **Expo Go** from the App Store or Google Play (keep it up to date: this project uses Expo SDK 57).
2. Put your phone and computer on the same Wi-Fi.
3. Run:

   ```bash
   cd roost-mobile
   npm install
   npx expo start
   ```

4. Scan the QR code: with the Camera app on iPhone, or the Expo Go app on Android.

If the phone can't reach your computer (school or public Wi-Fi often blocks it), use `npx expo start --tunnel` instead.

Sign in with any `@mail.uc.edu` email and the demo code `123456`.

Other handy commands: `npm run ios` or `npm run android` (needs a simulator or emulator), `npm run web` (browser preview), `npx tsc --noEmit` and `npx expo lint`.

## Same data as the web app

`src/lib/` holds copies of the web app's `types`, `listings`, `filters`, `format`, `copy`, `insights` and `config` files, plus the demo photos in `assets/photos/`. They are copied by:

```bash
npm run sync        # run after changing anything in ../uc-sublease/lib or its photos
```

So edit those in the web app, then sync. The one-line switch works here too: `RIGHT_SWIPE_ACTION` in `uc-sublease/lib/config.ts` (`"message"` or `"shortlist"`), then `npm run sync`.

## Structure

```
src/app/            screens (Expo Router: one file per route)
  (tabs)/           Discover (swipe deck), Browse, Saved + compare, Messages, Post
  listing/[id].tsx  listing detail      chat/[id].tsx  chat
  signin.tsx  welcome.tsx  account.tsx
src/components/     SwipeDeck, ListingCard, ListingRow, FilterSheet, CompareTable, ui helpers
src/lib/            store (AsyncStorage), theme (light + dark), haptics, and the synced shared files
assets/photos/      demo photos (Unsplash, not the actual units)
scripts/sync-shared.mjs
```

## Notes

- Dark mode follows the phone's setting.
- Date entry on the Post screen is typed as `YYYY-MM-DD`, or filled with the Spring/Summer/Fall chips. The filter sheet uses the same term presets.
- Not included, same as the web demo: payments, real auth, maps.
- Photos are free Unsplash images used as placeholders.

## Status of the new features (web first)

Ported to the phone app: distance filter, List/Map toggle (native only), icon amenities, nearby stops, roommate fit on listings, rank by fit with Show all, sublet fee on listings and in compare.

Not yet ported (web only): the roommate **preferences screen** (so there is no way to set preferences on the phone yet), address lookup and the fee-split slider on the Post screen (the phone Post screen still picks the nearest area), and the household ratings and amenity picker on Post.
