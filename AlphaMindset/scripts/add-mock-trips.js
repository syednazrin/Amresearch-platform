// Run this script with: node scripts/add-mock-trips.js
// This adds mock trips spread across current and upcoming months for testing the calendar view
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mzaidasham1_db_user:duUdWlrltI1ubJZ2@cluster0.addz23u.mongodb.net/?appName=Cluster0';

async function addMockTrips() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('aminvest');
    const trips = db.collection('trips');
    
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Create trips spread across current month and next 3 months
    const mockTrips = [
      // Current month - spread across different weeks
      {
        companyName: 'Samsung Electronics',
        date: new Date(currentYear, currentMonth, 5),
        location: 'Seoul, South Korea',
        description: 'Semiconductor manufacturing facility tour and discussion on memory chip innovations and production capacity expansion plans.',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        createdAt: new Date(),
        order: 1
      },
      {
        companyName: 'TSMC (Taiwan Semiconductor)',
        date: new Date(currentYear, currentMonth, 12),
        location: 'Hsinchu, Taiwan',
        description: 'Advanced chip fabrication facility visit. Deep dive into 3nm and 5nm process technologies and future roadmap.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
        createdAt: new Date(),
        order: 2
      },
      {
        companyName: 'Tencent Holdings',
        date: new Date(currentYear, currentMonth, 18),
        location: 'Shenzhen, China',
        description: 'Corporate headquarters visit focusing on gaming, cloud services, and fintech divisions. Meeting with executive leadership.',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        createdAt: new Date(),
        order: 3
      },
      {
        companyName: 'Alibaba Group',
        date: new Date(currentYear, currentMonth, 25),
        location: 'Hangzhou, China',
        description: 'E-commerce and cloud infrastructure tour. Discussion on international expansion and AI capabilities.',
        imageUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800',
        createdAt: new Date(),
        order: 4
      },
      
      // Next month
      {
        companyName: 'Meta Platforms',
        date: new Date(currentYear, currentMonth + 1, 3),
        location: 'Menlo Park, California',
        description: 'Reality Labs visit and discussion on VR/AR development, metaverse strategy, and AI research initiatives.',
        imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
        createdAt: new Date(),
        order: 5
      },
      {
        companyName: 'Netflix',
        date: new Date(currentYear, currentMonth + 1, 10),
        location: 'Los Gatos, California',
        description: 'Content production studio tour and meeting with content strategy team. Discussion on international expansion and original content pipeline.',
        imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800',
        createdAt: new Date(),
        order: 6
      },
      {
        companyName: 'Oracle Corporation',
        date: new Date(currentYear, currentMonth + 1, 17),
        location: 'Austin, Texas',
        description: 'Cloud infrastructure and database technology briefing. Focus on enterprise solutions and competitive positioning.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        createdAt: new Date(),
        order: 7
      },
      {
        companyName: 'Intel Corporation',
        date: new Date(currentYear, currentMonth + 1, 24),
        location: 'Santa Clara, California',
        description: 'Chip manufacturing facility tour. Discussion on foundry services expansion and next-generation processor development.',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        createdAt: new Date(),
        order: 8
      },
      
      // Month after next
      {
        companyName: 'Google (Alphabet)',
        date: new Date(currentYear, currentMonth + 2, 7),
        location: 'Mountain View, California',
        description: 'Google Cloud and AI research facility visit. Deep dive into Gemini AI capabilities and cloud infrastructure.',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        createdAt: new Date(),
        order: 9
      },
      {
        companyName: 'Adobe Inc.',
        date: new Date(currentYear, currentMonth + 2, 14),
        location: 'San Jose, California',
        description: 'Creative software development center tour. Discussion on AI integration in creative tools and subscription model growth.',
        imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
        createdAt: new Date(),
        order: 10
      },
      {
        companyName: 'Salesforce',
        date: new Date(currentYear, currentMonth + 2, 21),
        location: 'San Francisco, California',
        description: 'CRM platform demonstration and meeting with product leadership. Focus on AI-powered customer engagement solutions.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
        createdAt: new Date(),
        order: 11
      },
      
      // Three months out
      {
        companyName: 'Palantir Technologies',
        date: new Date(currentYear, currentMonth + 3, 5),
        location: 'Denver, Colorado',
        description: 'Data analytics platform demonstration. Discussion on enterprise AI solutions and government contracts.',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        createdAt: new Date(),
        order: 12
      },
      {
        companyName: 'Zoom Video Communications',
        date: new Date(currentYear, currentMonth + 3, 15),
        location: 'San Jose, California',
        description: 'Product development center visit. Discussion on enterprise communication solutions and platform expansion.',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        createdAt: new Date(),
        order: 13
      }
    ];
    
    // Insert trips
    const result = await trips.insertMany(mockTrips);
    console.log(`✅ Successfully added ${result.insertedCount} mock trips`);
    console.log('\nTrips added across:');
    console.log(`- Current month (${monthNames[currentMonth]} ${currentYear})`);
    console.log(`- Next month (${monthNames[(currentMonth + 1) % 12]} ${currentMonth + 1 > 11 ? currentYear + 1 : currentYear})`);
    console.log(`- Month after next (${monthNames[(currentMonth + 2) % 12]} ${currentMonth + 2 > 11 ? currentYear + 1 : currentYear})`);
    console.log(`- Three months out (${monthNames[(currentMonth + 3) % 12]} ${currentMonth + 3 > 11 ? currentYear + 1 : currentYear})`);
    console.log('\n🌐 Visit /trips/calendar to see the trips in the calendar view!');
    
  } catch (error) {
    console.error('Error adding mock trips:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

addMockTrips();
