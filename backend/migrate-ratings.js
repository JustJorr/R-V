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
  const allDocs = await collection.find().toArray();
  console.log(`Found ${allDocs.length} total documents`);

  if (allDocs.length > 0) {
    const seen = new Set();

    const ops = [];

    allDocs.forEach(doc => {
      const d = new Date(doc.createdAt);
      const year  = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateKey = `${year}-${month}`;

      const key = `${doc.ratedBy}_${doc.ratedUser}_${dateKey}`;

      if (!seen.has(key)) {
        seen.add(key);

        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { dateKey } }
          }
        });
      } else {
        // duplicate → delete it
        ops.push({
          deleteOne: {
            filter: { _id: doc._id }
          }
        });
      }
    });

    const result = await collection.bulkWrite(ops);
    console.log(`Updated ${result.modifiedCount} document(s) to monthly format`);
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