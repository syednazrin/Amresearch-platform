// Run from project root: node scripts/add-fake-signups.js
// Adds fake sign-ups for the SECOND trip in the Company Visits list so you can test "View sign-ups".
require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const fakeRegistrations = [
  { name: 'Ahmad Rahman', email: 'ahmad.rahman@example.com', company: 'Maybank Asset Management', phone: '+60 12 345 6789', notes: 'Interested in semiconductor sector exposure.' },
  { name: 'Sarah Lim', email: 'sarah.lim@fund.com', company: 'KWAP', phone: '+60 19 876 5432', notes: '' },
  { name: 'David Tan', email: 'david.tan@invest.my', company: 'Permodalan Nasional Berhad', phone: '', notes: 'Would like to join the Q&A session if available.' },
  { name: 'Priya Rajendran', email: 'priya.r@insurance.com.my', company: 'Great Eastern Life', phone: '+60 13 222 3344', notes: 'First time joining. Looking forward to it.' },
  { name: 'Michael Wong', email: 'm.wong@privatebank.com', company: 'CIMB Private Banking', phone: '+60 16 555 6677', notes: 'Bringing 2 colleagues if capacity allows.' },
];

async function addFakeSignups() {
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
    const tripsCol = db.collection('trips');
    const regCol = db.collection('trip_registrations');

    const trips = await tripsCol.find({}).sort({ date: 1 }).toArray();
    if (trips.length < 2) {
      console.log('Need at least 2 trips. Found:', trips.length);
      console.log('Add more trips first (e.g. run scripts/add-mock-trips.js), then run this again.');
      return;
    }

    const secondTrip = trips[1];
    const tripId = secondTrip._id;
    console.log('Second trip:', secondTrip.companyName, '| date:', secondTrip.date);

    const existing = await regCol.countDocuments({ tripId });
    if (existing > 0) {
      console.log('This trip already has', existing, 'sign-up(s). Skipping to avoid duplicates.');
      return;
    }

    const now = new Date();
    const docs = fakeRegistrations.map((r, i) => ({
      tripId,
      name: r.name,
      email: r.email,
      company: r.company || '',
      phone: r.phone || '',
      notes: r.notes || '',
      status: 'pending',
      createdAt: new Date(now.getTime() - (fakeRegistrations.length - i) * 3600000),
    }));

    const result = await regCol.insertMany(docs);
    console.log('Inserted', result.insertedCount, 'fake sign-ups for trip:', secondTrip.companyName);
    console.log('In Admin → Company Visits, click the Users icon on the second row to view them.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

addFakeSignups();
