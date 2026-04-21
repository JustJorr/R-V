/**
 * migrate-ratings.js
 * 
 * Run ONCE with:  node migrate-ratings.js
 * 
 * What it does:
 *  1. Drops the old (ratedBy, ratedUser) unique index that has no dateKey.
 *  2. Backfills a dateKey on every rating document that is missing one,
 *     derived from the document's createdAt timestamp.
 *  3. The correct (ratedBy, ratedUser, dateKey) index is already defined in
 *     your schema — Mongoose will recreate it on next app start.
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collection = db.collection("ratings");

  // ── Step 1: Drop the old two-field unique index ──────────────────────────
  try {
    await collection.dropIndex("ratedBy_1_ratedUser_1");
    console.log("Dropped old index: ratedBy_1_ratedUser_1");
  } catch (err) {
    if (err.codeName === "IndexNotFound") {
      console.log("Old index not found — already dropped, skipping.");
    } else {
      throw err;
    }
  }

  // ── Step 2: Backfill dateKey on documents that are missing it ────────────
  const missing = await collection.find({ dateKey: { $exists: false } }).toArray();
  console.log(`Found ${missing.length} document(s) missing a dateKey`);

  if (missing.length > 0) {
    const ops = missing.map(doc => {
      const d = new Date(doc.createdAt);
      const year  = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day   = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { dateKey } }
        }
      };
    });

    const result = await collection.bulkWrite(ops);
    console.log(`Backfilled dateKey on ${result.modifiedCount} document(s)`);
  }

  // ── Step 3: Report current indexes so you can confirm ────────────────────
  const indexes = await collection.indexes();
  console.log("\nCurrent indexes on 'ratings':");
  indexes.forEach(idx => console.log(" ", JSON.stringify(idx.key), idx.unique ? "(unique)" : ""));

  await mongoose.disconnect();
  console.log("\nMigration complete.");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});