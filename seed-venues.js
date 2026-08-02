/* ============================================================
   FIND FOODIES — Firestore venue seeder
   Loads all London venues from seed-venues.json into Firestore.
   Run this ONCE from Cloud Shell (see SETUP-GUIDE Part 5).
   ============================================================ */
const admin = require("firebase-admin");
const fs = require("fs");

// Uses Application Default Credentials in Cloud Shell (no key file needed
// because Cloud Shell is already authenticated to your project).
admin.initializeApp({ projectId: "yumble-app" });
const db = admin.firestore();

async function seed() {
  const venues = JSON.parse(fs.readFileSync("seed-venues.json", "utf8"));
  console.log(`Seeding ${venues.length} venues...`);

  // Firestore batches max 500 writes; chunk them.
  const chunkSize = 400;
  let written = 0;
  for (let i = 0; i < venues.length; i += chunkSize) {
    const batch = db.batch();
    const slice = venues.slice(i, i + chunkSize);
    for (const v of slice) {
      const ref = db.collection("venues").doc(String(v.id));
      batch.set(ref, {
        name: v.name, area: v.area, postcode: v.postcode,
        lat: v.lat, lng: v.lng, rating: v.rating, price: v.price,
        cuisines: v.cuisines, diets: v.diets, tags: v.tags,
        offer: v.offer || null, hours: v.hours, img: v.img,
        ownerUid: null,            // null = seeded by Foodies (not yet claimed by a restaurant)
        source: "seed",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await batch.commit();
    written += slice.length;
    console.log(`  committed ${written}/${venues.length}`);
  }
  console.log("✅ Done. All venues seeded to Firestore.");
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
