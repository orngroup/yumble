# Yumble — Backend & Subdomain Setup Guide

This turns the demo into a **real, saving app** with three subdomains, real sign-in, a live database, and 1,233 London venues. You will create a fresh Firebase project (name it e.g. `yumble-app`). Use its real project ID wherever this guide shows `yumble-app`. Work top to bottom. You're proficient, so this is concise but complete.

---

## The structure

```
ffsite/
├── firebase.json        → deploys 3 hosting sites at once
├── .firebaserc          → maps sites to targets
├── firestore.rules      → security rules (IMPORTANT)
├── seed-venues.js       → loads 1,233 venues into Firestore
├── seed-venues.json     → the venue data
├── customer/            → yumble.app   (website + /app/)
├── partner/             → partner.yumble.app
└── admin/               → admin.yumble.app
```

Live targets after setup:
- **yumble.app** → customer site (marketing + the PWA at `/app/`)
- **partner.yumble.app** → restaurant portal
- **admin.yumble.app** → your admin console

---

## Part 1 — Create the three Hosting sites

In **Firebase Console → Hosting**, you'll add two more sites (you already have the default one).

1. On the Hosting dashboard, click **Add another site**.
2. Create site: **yumble-customer**
3. Repeat → **yumble-partner**
4. Repeat → **yumble-admin**

(You'll now have 3 sites. Names must match `.firebaserc`.)

---

## Part 2 — Deploy all three (Cloud Shell)

1. Open **Cloud Shell** (`>_`), project `yumble-app`.
2. Upload this whole package as a zip → `unzip` it → `cd` into the `ffsite` folder.
3. Link the hosting targets (once):
   ```
   firebase target:apply hosting customer yumble-customer
   firebase target:apply hosting partner yumble-partner
   firebase target:apply hosting admin yumble-admin
   ```
4. Deploy everything:
   ```
   firebase deploy --only hosting
   ```
   You'll get three URLs:
   - yumble-customer.web.app
   - yumble-partner.web.app
   - yumble-admin.web.app

Test all three load.

---

## Part 3 — Enable Authentication (Google, Apple, Facebook, Email)

**Firebase Console → Build → Authentication → Get started → Sign-in method.** Enable:

- **Google** — one click, pick a support email. Done.
- **Email/Password** — toggle on.
- **Facebook** — needs a Facebook App (developers.facebook.com → create app → get App ID + Secret → paste into Firebase → copy Firebase's OAuth redirect URI back into Facebook). ~15 min.
- **Apple** — needs an Apple Developer account ($99/yr). Add Service ID + key. Do this later if you don't have the Apple account yet — Google + Email is enough to launch.

**Authorized domains:** under Authentication → Settings → Authorized domains, add `yumble.app`, `partner.yumble.app`, `admin.yumble.app` (and the `.web.app` ones are added automatically).

---

## Part 4 — Create the database (Firestore)

1. **Console → Build → Firestore Database → Create database.**
2. **Production mode.** Location: **europe-west2 (London)**.
3. Once created, go to the **Rules** tab and paste the contents of `firestore.rules` from this package → **Publish.** (These rules protect user data — don't skip.)

### Make yourself an admin
The rules treat anyone with a doc in the `admins` collection as an admin.
1. Firestore → Start collection → ID `admins`.
2. Add a document whose **ID = your Firebase Auth UID** (sign in once to the app to create your user, copy the UID from Authentication → Users). Any field, e.g. `role: "owner"`.

Now your account can access admin-only data.

---

## Part 5 — Seed the 1,233 venues

In **Cloud Shell**, inside the `ffsite` folder:
```
npm install firebase-admin
node seed-venues.js
```
It writes all 1,233 venues into the `venues` collection in batches. You'll see `✅ Done`. Check Firestore → `venues` — they're there, editable.

---

## Part 6 — Turn the app from demo to live

1. **Console → Project settings → General → Your apps.** If no web app exists, click **`</>`** to register one → copy the `firebaseConfig` object.
2. In `customer/app/`, open the Firebase include (the `firebase-config.js` / module script) and:
   - Paste your `firebaseConfig` values.
   - Set `DEMO_MODE = false`.
3. Redeploy: back in Cloud Shell → `firebase deploy --only hosting`.

Now sign-in is real, profiles/matches/messages/bookings save to Firestore, and venues load from the database. The restaurant portal writes new venues to `venues` (with `ownerUid` set), and they appear live in the app.

> **Wiring note:** the app's screens currently call the demo functions. The `window.FF` data layer (in the Firebase module) has the real Firestore/Auth code ready. Connecting each screen's button to `window.FF.*` instead of the demo function is the final integration step — a focused day's work. Everything is structured and named so it's straightforward; hand this guide + the `FF` object to a developer if you'd rather delegate that last mile.

---

## Part 7 — Google Places (live restaurant search) — optional

1. **Google Cloud Console** (same project) → enable **Places API**.
2. Create an API key, restrict it to Places API.
3. **Keep the key secret:** don't put it in the app. Instead deploy a tiny **Cloud Function** that proxies Places requests (the app calls `/api/places`, the function adds the key). The `FF.searchPlaces` function already calls that endpoint.
4. Set `USE_PLACES = true`.

Remember Places' terms: display results live, don't permanently store them as your own. Your 1,233 seeded venues are yours; Places results supplement search.

---

## Part 8 — Connect your real domain

Once you've **bought yumble.app**:
1. **Console → Hosting → (customer site) → Add custom domain → `yumble.app`.**
2. **partner site → Add custom domain → `partner.yumble.app`.**
3. **admin site → Add custom domain → `admin.yumble.app`.**
4. Firebase gives you DNS records — add them at your registrar. SSL is automatic in a few hours.

---

## Part 9 — Google Play (launch as Android app)

1. Live customer app must be on HTTPS (it will be).
2. **pwabuilder.com** → enter `https://yumble.app/app/` → generate the Android package (`.aab`).
3. **Google Play Console** ($25 one-time) → create app → upload the `.aab` → fill listing (icon, screenshots, description, **privacy policy URL** — required for dating apps) → set content rating → submit. Review takes a few days.

Membership is **free for 6 months**, then £14.99/mo — already reflected in the app. No card is taken during the free period.

---

## Sensible order

1. Deploy 3 sites (Parts 1–2). ✅ shareable immediately.
2. Auth + Firestore + rules (Parts 3–4).
3. Seed venues (Part 5).
4. Flip DEMO_MODE off + wire screens to `FF` (Part 6).
5. Test with real friends.
6. Domain (Part 8) → Play Store (Part 9).
7. Places + Apple sign-in later.

## Honest reminders
- Don't take real users until Parts 3–6 are done and tested — before that, data doesn't save.
- The security rules are the one thing to get right; they're written for you here — publish them and test.
- The "wire each screen to FF" step (Part 6) is the last real coding task; budget a focused day, yours or a developer's.
