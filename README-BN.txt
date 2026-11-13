# FREE INCOME BD — Setup Guide

This is a starter point/reward platform, not a promise of income or a real-money payment processor.
The withdraw feature creates demo-only review requests. Do not collect bank/mobile-wallet numbers or promise payouts in this version.

## Included
- `public/`: responsive web app, Firebase client config, login/signup, user dashboard, tasks, history, demo redemption request, admin UI.
- `firestore.rules`: least-privilege rules. Wallet and transaction writes are server-only.
- `functions/`: trusted Cloud Functions for daily check-in, task review/reward credit, and demo request review.
- `scripts/set-admin.js`: one-time trusted admin custom-claim setup.

## Firebase project
Project ID: `free-income-9e4e3`
Firestore region selected in setup: `asia-south1` (Mumbai).
Functions in this starter use `asia-southeast1` (Singapore), and the client is configured to call that region. Firestore is in `asia-south1` (Mumbai); these services can use different regions, though cross-region calls may add latency.

## Step 1 — Firebase Authentication
Firebase Console > Authentication > Sign-in method > Email/Password > Enable.

## Step 2 — Firestore rules
Firebase Console > Firestore Database > Rules. Publish the contents of `firestore.rules`.
Do NOT paste these rules into Realtime Database rules.

## Step 3 — Register / deploy web app
Upload the contents of `public/` to Netlify or another static host. Keep `firebase-config.js` beside `index.html`.
In Firebase Console > Authentication > Settings > Authorized domains, add your deployed domain (for example `your-site.netlify.app`).

## Step 4 — Cloud Functions
Install Node.js 20 and Firebase CLI on a computer:
- `npm install -g firebase-tools`
- `firebase login`
- `firebase use --add` and select `free-income-9e4e3`
- `cd functions && npm install`
- `cd .. && firebase deploy --only functions`

Cloud Functions deployment may require the Blaze billing plan and a billing account. Do not enable paid services unless you understand possible charges. If you cannot deploy Functions, the daily check-in and admin review reward actions will not work; do not replace them with client-side wallet writes.

## Step 5 — Grant the first admin securely
1. Create your own account through the website.
2. Firebase Console > Authentication > Users: copy that account's UID.
3. Download a service account key only to a trusted computer (never upload it to the website or share it).
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the key file path.
5. Install admin SDK in project root: `npm install firebase-admin`
6. Run `node scripts/set-admin.js YOUR_USER_UID`.
7. Sign out and sign back in; the Admin tab should appear.

Never add `admin:true` to a Firestore user document as a substitute for custom claims. Never put service account credentials in `public/`.

## Data collections
`users`, `wallets`, `tasks`, `submissions`, `withdrawals`, `transactions`, `checkins`.
Wallets and transaction records are server-write-only.

## Important notes
- Referral UI/crediting is not yet implemented in this starter.
- Task proof is a text note only; do not ask users to submit passwords, OTPs, or sensitive documents.
- Daily check-in uses UTC day boundaries in this starter.
- Demo redemption requests do not send money and are marked `reviewed_demo_only`.
- Before real payments, consult a qualified adult/guardian and payment provider requirements; add proper server-side fraud checks, audit logs, legal terms, and secure payout integration.
