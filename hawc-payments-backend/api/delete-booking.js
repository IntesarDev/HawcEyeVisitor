import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ ok: false });
  }

  try {
    await admin.firestore().collection("bookings").doc(id).delete();
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
}
