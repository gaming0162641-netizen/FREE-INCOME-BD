const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
initializeApp();
const db = getFirestore();
function requireAdmin(request) {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}
exports.dailyCheckin = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Please login.");
  const uid = request.auth.uid;
  const today = new Date().toISOString().slice(0,10);
  const walletRef = db.doc(`wallets/${uid}`);
  const checkinRef = db.doc(`checkins/${uid}_${today}`);
  return db.runTransaction(async tx => {
    const old = await tx.get(checkinRef);
    if (old.exists) throw new HttpsError("already-exists", "আজকের check-in হয়ে গেছে।");
    const walletSnap = await tx.get(walletRef);
    const balance = walletSnap.exists ? Number(walletSnap.data().balance || 0) : 0;
    const total = walletSnap.exists ? Number(walletSnap.data().totalEarned || 0) : 0;
    const reward = 5;
    tx.set(walletRef, { balance: balance + reward, totalEarned: total + reward, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.create(checkinRef, { userId: uid, day: today, reward, createdAt: FieldValue.serverTimestamp() });
    const tr = db.collection("transactions").doc();
    tx.create(tr, { userId: uid, points: reward, type: "daily_checkin", description: "Daily check-in", createdAt: FieldValue.serverTimestamp() });
    return { reward };
  });
});
exports.reviewSubmission = onCall({ region: "asia-southeast1" }, async request => {
  requireAdmin(request);
  const { submissionId, approve } = request.data || {};
  if (typeof submissionId !== "string" || typeof approve !== "boolean") throw new HttpsError("invalid-argument","Invalid request.");
  const subRef = db.doc(`submissions/${submissionId}`);
  return db.runTransaction(async tx => {
    const s = await tx.get(subRef);
    if (!s.exists || s.data().status !== "pending") throw new HttpsError("failed-precondition","Submission is not pending.");
    const data = s.data();
    let reward = 0;
    if (approve) {
      const taskSnap = await tx.get(db.doc(`tasks/${data.taskId}`));
      if (!taskSnap.exists || taskSnap.data().isActive !== true) throw new HttpsError("failed-precondition","Task unavailable.");
      reward = Number(taskSnap.data().rewardPoints || 0);
      if (!Number.isInteger(reward) || reward < 1 || reward > 10000) throw new HttpsError("failed-precondition","Invalid task reward.");
      const walletRef = db.doc(`wallets/${data.userId}`);
      const w = await tx.get(walletRef);
      const balance = w.exists ? Number(w.data().balance || 0) : 0;
      const earned = w.exists ? Number(w.data().totalEarned || 0) : 0;
      tx.set(walletRef,{balance:balance+reward,totalEarned:earned+reward,updatedAt:FieldValue.serverTimestamp()},{merge:true});
      const tr=db.collection("transactions").doc();
      tx.create(tr,{userId:data.userId,points:reward,type:"task_reward",description:"Approved task reward",createdAt:FieldValue.serverTimestamp()});
    }
    tx.update(subRef,{status:approve?"approved":"rejected",reviewedAt:FieldValue.serverTimestamp(),reviewedBy:request.auth.uid,reward});
    return {status:approve?"approved":"rejected",reward};
  });
});
exports.reviewWithdrawal = onCall({ region: "asia-southeast1" }, async request => {
  requireAdmin(request);
  const { withdrawalId } = request.data || {};
  if (typeof withdrawalId !== "string") throw new HttpsError("invalid-argument","Invalid request.");
  const ref=db.doc(`withdrawals/${withdrawalId}`);
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists || snap.data().status!=="pending") throw new HttpsError("failed-precondition","Request is not pending.");
    tx.update(ref,{status:"reviewed_demo_only",reviewedAt:FieldValue.serverTimestamp(),reviewedBy:request.auth.uid});
  });
  return {status:"reviewed_demo_only"};
});
