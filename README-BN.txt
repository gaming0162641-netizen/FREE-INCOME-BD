FREE INCOME BD — Netlify Build

1) Netlify: deploy this folder or connect the repository. Publish directory must be `public`.
2) Firebase Authentication > Settings > Authorized domains: add your exact Netlify subdomain, e.g. your-name.netlify.app.
3) Firebase Console > Firestore Database > Rules: publish this project's firestore.rules.
4) Cloud Functions: on a trusted computer install Node.js 20 and Firebase CLI.
   npm install -g firebase-tools
   firebase login
   firebase use --add   (select free-income-9e4e3)
   cd functions && npm install
   cd .. && firebase deploy --only functions
5) Account ID is assigned by ensureAccountId Cloud Function using a Firestore transaction and a server-only counter. Existing accounts without accountId receive the next available number on their next login. Existing Firebase UID is unchanged.
6) Admin custom claim: follow scripts/set-admin.js instructions from a trusted computer only. Never upload service-account JSON to Netlify/public.
7) `dailyCheckin`, task review and admin review also require deployed Cloud Functions.

IMPORTANT:
- This is a demo points/rewards starter, not a real income or payment service.
- Redemption/withdraw requests are demo records only. No real money is sent.
- Cloud Functions deployment may require Firebase Blaze billing and can incur charges. Do not enable paid billing without a guardian/adult's help and review of possible charges.
- Do not collect passwords, OTPs, bank/mobile wallet details or sensitive documents in tasks.
