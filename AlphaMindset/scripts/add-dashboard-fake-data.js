// Run from project root: node scripts/add-dashboard-fake-data.js
// Adds fake analytics data so the dashboard (Daily view + General) looks populated.
require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const fakeFeedbackEntries = [
  { agreedWithThesis: true, rating: 5, feedback: 'Strong thesis, aligned with our view.' },
  { agreedWithThesis: true, rating: 4, feedback: '' },
  { agreedWithThesis: false, rating: 2, feedback: 'See risk to margins in 2H.' },
  { agreedWithThesis: true, rating: 4, feedback: 'Useful for the sector call.' },
  { agreedWithThesis: true, rating: 5, feedback: '' },
  { agreedWithThesis: false, rating: 3, feedback: 'Mixed on the valuation assumptions.' },
  { agreedWithThesis: true, rating: 4, feedback: 'Good summary.' },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('aminvest');
    const documents = db.collection('documents');
    const feedback = db.collection('document_feedback');
    const documentViews = db.collection('document_views');

    const allDocs = await documents.find({ isPublished: true }).toArray();
    if (allDocs.length === 0) {
      console.log('No published documents found. Publish some reports first, then run this script.');
      return;
    }

    const today = todayStart();

    // 1) Set 2-3 documents to "published today" with view counts (for Daily view)
    const toMakeToday = allDocs.slice(0, Math.min(3, allDocs.length));
    for (const doc of toMakeToday) {
      await documents.updateOne(
        { _id: doc._id },
        {
          $set: {
            uploadedAt: new Date(today.getTime() + Math.floor(Math.random() * 8) * 3600000),
            viewCount: 12 + Math.floor(Math.random() * 40),
          },
        }
      );
      console.log('Updated today:', doc.title, '| views:', 12 + Math.floor(Math.random() * 40));
    }

    // 2) Add fake feedback for those documents (for agree %, avg rating, comments)
    for (const doc of toMakeToday) {
      const existing = await feedback.countDocuments({ documentId: doc._id });
      if (existing > 0) continue;

      const count = 3 + Math.floor(Math.random() * 4);
      const toInsert = [];
      for (let i = 0; i < count; i++) {
        const entry = fakeFeedbackEntries[i % fakeFeedbackEntries.length];
        toInsert.push({
          documentId: doc._id,
          userId: null,
          agreedWithThesis: entry.agreedWithThesis,
          rating: entry.rating,
          feedback: entry.feedback,
          submittedAt: new Date(Date.now() - Math.random() * 3600000 * 6),
        });
      }
      await feedback.insertMany(toInsert);
      console.log('Added', toInsert.length, 'feedback entries for', doc.title);
    }

    // 3) Fake document_views for today (so "When reports are read" chart has data)
    const existingViews = await documentViews.countDocuments({
      viewedAt: { $gte: today, $lt: new Date(today.getTime() + 24 * 3600000) },
    });
    if (existingViews === 0) {
      const viewInserts = [];
      for (const doc of toMakeToday) {
        const numViews = 8 + Math.floor(Math.random() * 20);
        for (let v = 0; v < numViews; v++) {
          const hour = 6 + Math.floor(Math.random() * 14);
          const minute = Math.floor(Math.random() * 60);
          const viewedAt = new Date(today);
          viewedAt.setHours(hour, minute, 0, 0);
          viewInserts.push({ documentId: doc._id, viewedAt });
        }
      }
      if (viewInserts.length > 0) {
        await documentViews.insertMany(viewInserts);
        console.log('Added', viewInserts.length, 'fake view events for today (reads by hour chart).');
      }
    }

    // 4) Spread some documents over the past 30 days with view counts (for General 7/30/all chart)
    const rest = allDocs.slice(toMakeToday.length, Math.min(allDocs.length, toMakeToday.length + 10));
    for (let i = 0; i < rest.length; i++) {
      const doc = rest[i];
      const daysAgo = 1 + Math.floor(Math.random() * 28);
      const uploadDate = new Date(today);
      uploadDate.setDate(uploadDate.getDate() - daysAgo);
      uploadDate.setHours(8 + Math.floor(Math.random() * 8), 0, 0, 0);
      await documents.updateOne(
        { _id: doc._id },
        {
          $set: {
            uploadedAt: uploadDate,
            viewCount: (doc.viewCount || 0) + 5 + Math.floor(Math.random() * 50),
          },
        }
      );
    }
    console.log('Updated', rest.length, 'documents with past dates and view counts for General chart.');

    console.log('');
    console.log('Done. Open Admin → Dashboard:');
    console.log('  - Daily view: time series (when reports are read today), today’s reports, and per-report analytics.');
    console.log('  - General: use 7 Days / 30 Days / All Time to see the chart.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
