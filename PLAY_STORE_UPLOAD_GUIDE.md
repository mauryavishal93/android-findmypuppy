# Find My Puppy — Google Play Store Upload Guide

Use this document when uploading the app to the Google Play Console. Fill in any placeholders (e.g. live URLs) before submitting.

---

## 1. App identity

| Field | Value |
|-------|--------|
| **App name** | Find My Puppy |
| **Package name** | `com.findmypuppy.app2` |
| **Version name** | 1.0 |
| **Version code** | 1 (increment for each release) |
| **Default language** | English (en-US) |

---

## 2. Store listing

### Short description (max 80 characters)

**Suggested:**
```
Find hidden puppies in fun levels! Play daily, earn hints, and climb the leaderboard.
```

**Alternative:**
```
Spot the pups! Hidden-object puzzle game with 300 levels and daily rewards.
```

### Full description (max 4000 characters)

**Suggested (copy and edit as needed):**

```
Find My Puppy is a casual hidden-object game where you find cute puppies hidden in colourful scenes.

🎮 GAMEPLAY
• Hundreds of levels across Easy, Medium, and Hard
• AI-generated scenes with puppies cleverly placed to blend in
• Timed challenges on Medium and Hard
• Use hints when you’re stuck (free hints per level + optional hint packs)

⭐ FEATURES
• Play as guest or create an account to save progress
• Sign in with Google or email
• Daily check-in: feed your puppy and earn streak rewards (hints and points)
• Leaderboard: compete with others by score
• Unlock themes and achievements as you play
• Refer friends and earn bonus hints

🛒 OPTIONAL IN-APP PURCHASES
• Hint packs (purchased with real money via Razorpay) to get more hints
• You can also earn hints by playing, daily check-ins, and referrals

🐾 FAMILY FRIENDLY
• Suitable for all ages
• No ads in the core experience
• COPPA-aware privacy practices; see our Privacy Policy for details

Download Find My Puppy and start finding those pups!
```

---

## 3. Categorisation & targeting

| Field | Recommended value |
|-------|-------------------|
| **Category** | Game → Puzzle |
| **Tags** | hidden object, puzzle, casual, family, dogs, puppies |
| **Target age groups** | If using target audience: e.g. 3+, 6+ (confirm based on your content rating) |
| **Countries/regions** | Select all where you want to distribute (e.g. India, US, etc.) |

---

## 4. Content rating

- **Questionnaire:** Complete the [Play Console Content rating questionnaire](https://support.google.com/googleplay/android-developer/answer/9888170) for your app.
- **Likely outcome:** PEGI 3 / Everyone (no violence, no inappropriate content). In-app purchases and optional sign-in should be declared in the questionnaire.
- **Rating:** Do not assume; use the rating issued after submitting the questionnaire.

---

## 5. Privacy & data safety

### Privacy Policy URL (required)

- **Required:** A publicly accessible URL to your privacy policy.
- **Example (replace with your live URL):**  
  `https://your-domain.com/privacy-policy.html`  
  Or if the app is served from the same origin:  
  `https://your-domain.com/FindMyPuppy/privacy-policy.html`
- **Local file in project:** `public/privacy-policy.html` — host this on your website and use that URL in Play Console.

### Data safety form (Play Console)

Declare the following in the “Data safety” section:

| Data type | Collected? | Purpose | Shared with third parties? |
|-----------|------------|---------|----------------------------|
| Email address | Yes (if user signs up) | Account, sign-in, support | No (or describe if you do) |
| Name / display name | Yes (if provided) | Account, leaderboard | No |
| User IDs | Yes | Account, progress, purchases | No |
| Purchase history | Yes | In-app purchases, support | Payment provider (Razorpay) per their policy |
| Game progress / scores | Yes | Sync, leaderboard | No |
| Sign-in (Google) | Optional | One-tap sign-in | Google (per Google Sign-In terms) |

- **Data processing:** Indicate whether data is processed in-app only or also on your servers (you use a backend, so select “Processed on your servers” where applicable).
- **Data encryption:** State if data in transit is encrypted (e.g. HTTPS).
- **Data deletion:** Mention that users can request account deletion (e.g. via email: findmypuppys@gmail.com), as in your privacy policy.

---

## 6. App access (if required)

- **Login required?** No — guests can play; login is optional for sync and leaderboard.
- **Test credentials (if you provide “Demo” access):** Optional; only if you offer a demo account for reviewers.

---

## 7. Ads & monetisation

| Question | Answer |
|----------|--------|
| **Contains ads?** | No |
| **Contains in-app purchases?** | Yes |
| **IAP types** | Consumable (hint packs). Optional: “Pay with points” (in-app points, not real money) — declare only if Play treats it as IAP. |

**In-app products (hint packs):** Configure in Play Console → Monetize → Products. Match product IDs and prices to what your app and backend expect (e.g. “100 Hints Pack” at your chosen price).

---

## 8. Permissions (declaration)

Declare and justify these in Play Console where asked:

| Permission | Purpose | Justification (for store/forms) |
|------------|---------|---------------------------------|
| INTERNET | API calls, sign-in, payments | Required for game data, login, and purchases |
| VIBRATE | Haptic feedback | Optional; used for in-game and UI feedback |
| POST_NOTIFICATIONS | Local reminders | Optional; for scheduled reminders (e.g. every 8 hours) |
| SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM | Scheduling notifications | Used for local notification scheduling |

- In the app, request only the permissions you actually use (e.g. notification permission when the user enables reminders).
- In the “Permission declaration” (if available), add a short justification like: “Vibration is used for haptic feedback when the user taps buttons or finds puppies. Notifications are used only for optional reminder alerts.”

---

## 9. Technical details (for your reference)

| Item | Value |
|------|--------|
| **Min SDK** | 24 (Android 7.0) |
| **Target SDK** | 36 (Android 14+) |
| **Compile SDK** | 36 |
| **Signing** | Use the same upload key for all updates (see your keystore / Play App Signing) |
| **Build output** | AAB recommended: `android/app/build/outputs/bundle/release/app-release.aab` |

---

## 10. Developer / contact

| Field | Value |
|-------|--------|
| **Developer name** | [Your individual or company name] |
| **Contact email** | findmypuppys@gmail.com |
| **Website (optional)** | [Your website URL] |

(Update “Developer name” and “Website” in Play Console to match your account.)

---

## 11. Pre-upload checklist

- [ ] **Version code** incremented in `android/app/build.gradle` for each new release.
- [ ] **Release build** signed with your upload key (or Play App Signing key).
- [ ] **Privacy Policy URL** is live and matches the one in Play Console.
- [ ] **Content rating** questionnaire completed and rating received.
- [ ] **Data safety** form filled with accurate data types and purposes.
- [ ] **In-app products** (hint packs) created in Play Console and IDs/prices aligned with app and server.
- [ ] **Store listing** (short + full description, screenshots, feature graphic, icon) added.
- [ ] **Testing:** Install the release AAB/APK and test sign-in, purchases (test card), and notifications on a real device.

---

## 12. Build and export release AAB

From project root:

```bash
cd android
./gradlew bundleRelease
```

Output: `app/build/outputs/bundle/release/app-release.aab`

Upload this file in Play Console: **Release → Production** (or a testing track) → **Create new release** → upload the AAB.

---

*Last updated: February 2025. Adjust version codes, URLs, and contact details to match your release and Play Console setup.*
