// Run only on your own trusted computer, never in the website/browser.
// 1) Download a service-account key from Firebase Console > Project settings > Service accounts.
// 2) Set GOOGLE_APPLICATION_CREDENTIALS to its local path.
// 3) Run: node scripts/set-admin.js USER_UID
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
initializeApp({credential: applicationDefault(), projectId:"free-income-9e4e3"});
(async()=>{
  const uid=process.argv[2];
  if(!uid){console.error("Usage: node scripts/set-admin.js USER_UID");process.exit(1);}
  const user=await getAuth().getUser(uid);
  await getAuth().setCustomUserClaims(uid,{...(user.customClaims||{}),admin:true});
  console.log("Admin claim granted to:",user.email,"UID:",uid);
  console.log("Sign out and sign in again to refresh the ID token.");
})().catch(e=>{console.error(e);process.exit(1);});
