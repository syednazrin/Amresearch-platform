require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const sampleReports = [
  {
    title: "Q4 2024 Market Outlook",
    description: "Comprehensive analysis of market trends and opportunities heading into Q4 2024. Our research indicates strong growth potential in technology and manufacturing sectors, with particular emphasis on sustainable investments.",
    category: "Market Analysis",
    viewCount: 245,
    isPublished: true,
    uploadedAt: new Date("2024-12-15"),
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Q4-2024-Market-Outlook.pdf",
  },
  {
    title: "Tech Sector Deep Dive",
    description: "In-depth examination of leading technology companies and emerging market opportunities. This report covers AI integration, cloud computing expansion, and semiconductor industry dynamics.",
    category: "Sector Report",
    viewCount: 189,
    isPublished: true,
    uploadedAt: new Date("2024-12-10"),
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Tech-Sector-Deep-Dive.pdf",
  },
  {
    title: "Renewable Energy Investment Guide",
    description: "Analysis of renewable energy sector growth, policy impacts, and investment opportunities across solar, wind, and emerging technologies. Features case studies from leading regional players.",
    category: "Sector Report",
    viewCount: 312,
    isPublished: true,
    uploadedAt: new Date("2024-12-05"),
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Renewable-Energy-Investment-Guide.pdf",
  },
  {
    title: "Malaysia Economic Forecast 2025",
    description: "Detailed economic forecast for Malaysia covering GDP growth, inflation trends, currency outlook, and sector-specific projections for the upcoming year.",
    category: "Economic Report",
    viewCount: 428,
    isPublished: true,
    uploadedAt: new Date("2024-11-28"),
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Malaysia-Economic-Forecast-2025.pdf",
  },
  {
    title: "Banking Sector Review",
    description: "Comprehensive review of the banking sector performance, regulatory changes, digital transformation initiatives, and competitive landscape analysis.",
    category: "Sector Report",
    viewCount: 167,
    isPublished: true,
    uploadedAt: new Date("2024-11-22"),
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Banking-Sector-Review.pdf",
  },
  {
    title: "ASEAN Trade Dynamics Report",
    description: "Analysis of trade flows, bilateral agreements, and economic integration within ASEAN markets. Includes impact assessment of recent trade policies and future outlook.",
    category: "Regional Report",
    viewCount: 203,
    isPublished: true,
    uploadedAt: new Date("2024-11-15"),
    imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "ASEAN-Trade-Dynamics-Report.pdf",
  },
  {
    title: "Real Estate Market Analysis",
    description: "Detailed analysis of residential and commercial real estate trends, pricing dynamics, investment opportunities, and market outlook across major Malaysian cities.",
    category: "Sector Report",
    viewCount: 276,
    isPublished: true,
    uploadedAt: new Date("2024-11-08"),
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Real-Estate-Market-Analysis.pdf",
  },
  {
    title: "Consumer Goods Sector Update",
    description: "Latest developments in the consumer goods sector, changing consumer preferences, e-commerce impact, and brand performance analysis.",
    category: "Sector Report",
    viewCount: 145,
    isPublished: true,
    uploadedAt: new Date("2024-11-01"),
    imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Consumer-Goods-Sector-Update.pdf",
  },
  {
    title: "Infrastructure Investment Opportunities",
    description: "Overview of infrastructure projects, government initiatives, private sector participation, and investment prospects in transportation and utilities.",
    category: "Investment Report",
    viewCount: 198,
    isPublished: true,
    uploadedAt: new Date("2024-10-25"),
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    fileUrl: "https://www.orimi.com/pdf-test.pdf",
    fileName: "Infrastructure-Investment-Opportunities.pdf",
  },
];

async function populateReports() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');
    
    const db = client.db('aminvest');
    const documents = db.collection('documents');
    
    // Clear existing documents and insert new ones with images
    await documents.deleteMany({});
    console.log('Cleared existing documents');
    
    // Insert sample reports
    const result = await documents.insertMany(sampleReports);
    console.log(`✓ Successfully inserted ${result.insertedCount} reports`);
    
    // Display inserted reports
    console.log('\nInserted reports:');
    sampleReports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.title} (${report.category})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

populateReports();
