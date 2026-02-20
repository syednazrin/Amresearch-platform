// Run this script with: node scripts/add-today-reports.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mzaidasham1_db_user:duUdWlrltI1ubJZ2@cluster0.addz23u.mongodb.net/?appName=Cluster0';

async function addTodayReports() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('aminvest');
    const documentsCollection = db.collection('documents');

    // Clear existing today's mock reports to avoid duplicates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await documentsCollection.deleteMany({ 
      isMockToday: true,
      uploadedAt: { $gte: today, $lt: tomorrow }
    });
    console.log('Cleared existing today\'s mock reports.');

    // Create multiple reports for today with different times
    const now = new Date();
    const reports = [
      {
        title: 'Q4 2024 Market Outlook',
        description: 'Comprehensive analysis of market trends and opportunities heading into Q4 2024. Our research indicates strong growth potential in technology and manufacturing sectors.',
        uploadedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0), // 9 AM today
        viewCount: 128,
        isPublished: true,
        isMockToday: true,
        category: 'Market Analysis',
        fileUrl: 'https://example.com/report1.pdf',
        fileName: 'q4-market-outlook.pdf',
      },
      {
        title: 'Technology Sector Deep Dive',
        description: 'In-depth research on artificial intelligence companies and their market positioning. Analysis of key players and emerging trends.',
        uploadedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0), // 11:00 AM today
        viewCount: 92,
        isPublished: true,
        isMockToday: true,
        category: 'Technology',
        fileUrl: 'https://example.com/report2.pdf',
        fileName: 'tech-sector-deep-dive.pdf',
      },
      {
        title: 'Banking Sector Update',
        description: 'Strategic analysis of the banking industry with focus on digital transformation and regulatory changes affecting the sector.',
        uploadedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30, 0), // 3:30 PM today
        viewCount: 67,
        isPublished: true,
        isMockToday: true,
        category: 'Finance',
        fileUrl: 'https://example.com/report3.pdf',
        fileName: 'banking-sector-update.pdf',
      },
    ];

    const result = await documentsCollection.insertMany(reports);
    console.log(`✅ Successfully added ${result.insertedCount} reports for today (${now.toLocaleDateString()})`);

    console.log('\n📊 Reports added:');
    reports.forEach((report, index) => {
      const time = report.uploadedAt.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      console.log(`  ${index + 1}. ${report.title} (${time})`);
    });

    console.log('\n🌐 Visit /documents to see the reports grouped by date!');
    console.log('📄 Click any report to see the same-day navigation panel on the left!');

  } catch (error) {
    console.error('Error adding today\'s reports:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

addTodayReports();
