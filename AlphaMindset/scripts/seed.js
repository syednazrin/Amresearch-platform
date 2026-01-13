// Run this script with: node scripts/seed.js
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://mzaidasham1_db_user:duUdWlrltI1ubJZ2@cluster0.addz23u.mongodb.net/?appName=Cluster0';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('aminvest');
    
    // Clear existing data (optional)
    console.log('Clearing existing trips...');
    await db.collection('trips').deleteMany({});
    
    // Seed Trips
    console.log('Seeding trips...');
    const trips = [
      {
        companyName: 'Tesla Inc.',
        date: new Date('2026-02-15'),
        location: 'Fremont, California',
        description: 'Factory tour and meeting with production team to discuss automation and sustainability initiatives.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
        createdAt: new Date(),
        order: 1
      },
      {
        companyName: 'NVIDIA Corporation',
        date: new Date('2026-02-22'),
        location: 'Santa Clara, California',
        description: 'Deep dive into AI chip development and data center solutions. Meeting with engineering leadership.',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
        createdAt: new Date(),
        order: 2
      },
      {
        companyName: 'Microsoft',
        date: new Date('2026-03-05'),
        location: 'Redmond, Washington',
        description: 'Cloud infrastructure review and Azure AI capabilities demonstration. Q&A with product teams.',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        createdAt: new Date(),
        order: 3
      },
      {
        companyName: 'SpaceX',
        date: new Date('2026-03-18'),
        location: 'Hawthorne, California',
        description: 'Starlink operations center visit and discussion on satellite internet expansion plans.',
        imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400',
        createdAt: new Date(),
        order: 4
      },
      {
        companyName: 'Amazon Web Services',
        date: new Date('2026-04-02'),
        location: 'Seattle, Washington',
        description: 'Data center tour and briefing on new cloud computing services and AI/ML infrastructure.',
        imageUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400',
        createdAt: new Date(),
        order: 5
      },
      {
        companyName: 'Apple Inc.',
        date: new Date('2026-04-20'),
        location: 'Cupertino, California',
        description: 'Innovation lab visit focusing on chip design, AR/VR development, and services ecosystem.',
        imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
        createdAt: new Date(),
        order: 6
      }
    ];
    
    await db.collection('trips').insertMany(trips);
    console.log(`✅ Inserted ${trips.length} trips`);
    
    // Note: Documents require actual PDF files to be uploaded via the admin interface
    console.log('\nℹ️  Documents need to be uploaded through the admin interface at /admin/documents');
    console.log('   You can upload PDF investment thesis documents there.');
    
    // Seed some availability slots for bookings
    console.log('\nSeeding availability slots...');
    await db.collection('availability_slots').deleteMany({});
    
    const availabilitySlots = [
      // Monday
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isActive: true },
      { dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isActive: true },
      // Tuesday
      { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isActive: true },
      { dayOfWeek: 2, startTime: '14:00', endTime: '17:00', isActive: true },
      // Wednesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', isActive: true },
      { dayOfWeek: 3, startTime: '14:00', endTime: '17:00', isActive: true },
      // Thursday
      { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isActive: true },
      { dayOfWeek: 4, startTime: '14:00', endTime: '17:00', isActive: true },
      // Friday
      { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', isActive: true },
      { dayOfWeek: 5, startTime: '13:00', endTime: '16:00', isActive: true },
    ];
    
    await db.collection('availability_slots').insertMany(availabilitySlots);
    console.log(`✅ Inserted ${availabilitySlots.length} availability slots`);
    
    // Seed Analysts
    console.log('\nSeeding analysts...');
    await db.collection('analysts').deleteMany({});
    
    const analysts = [
      {
        name: 'Sarah Johnson',
        title: 'Senior Investment Analyst',
        bio: 'Over 15 years of experience in equity research and portfolio management. Specializes in technology and healthcare sectors.',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        availabilitySlots: [
          // Monday & Wednesday
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' },
          // Friday
          { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' },
        ],
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Michael Chen',
        title: 'Chief Market Strategist',
        bio: 'Expert in macroeconomic analysis and market trends. Former hedge fund manager with a track record of successful predictions.',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        availabilitySlots: [
          // Tuesday & Thursday
          { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 2, startTime: '14:00', endTime: '16:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 4, startTime: '14:00', endTime: '16:00' },
        ],
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Emily Rodriguez',
        title: 'ESG & Sustainable Investment Specialist',
        bio: 'Focused on environmental, social, and governance investing. Helps clients align their portfolios with their values.',
        photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        availabilitySlots: [
          // Monday, Wednesday, Friday
          { dayOfWeek: 1, startTime: '10:00', endTime: '13:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '13:00' },
          { dayOfWeek: 3, startTime: '15:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '13:00' },
        ],
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'David Park',
        title: 'Emerging Markets Analyst',
        bio: 'Specializes in Asian and Latin American markets. Brings unique insights into high-growth international opportunities.',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        availabilitySlots: [
          // Tuesday, Thursday
          { dayOfWeek: 2, startTime: '13:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '13:00', endTime: '17:00' },
          // Friday
          { dayOfWeek: 5, startTime: '14:00', endTime: '16:00' },
        ],
        isActive: true,
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    await db.collection('analysts').insertMany(analysts);
    console.log(`✅ Inserted ${analysts.length} analysts`);
    
    // Note: Actual PDF documents need to be uploaded through the admin interface
    // The following is just metadata for demonstration
    console.log('\nNote: Documents can be uploaded at /admin/documents');
    console.log('      PDF files will be stored in Cloudflare R2 storage.');
    
    console.log('\n✅ Seeding completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000 to see the trips on the homepage');
    console.log('2. Login at http://localhost:3000/login (admin@aminvest.com / admin123)');
    console.log('3. Manage analysts at /admin/analysts');
    console.log('4. Upload investment thesis PDF documents at /admin/documents');
    console.log('5. Test the 4-step booking flow at /book');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

seed();
