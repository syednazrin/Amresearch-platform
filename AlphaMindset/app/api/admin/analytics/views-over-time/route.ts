import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    
    if (daysParam === '7') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (daysParam === '30') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (daysParam === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else {
      // All time - set to a very early date
      startDate = new Date(0);
    }

    startDate.setHours(0, 0, 0, 0);

    // Get all published documents
    const documents = await getCollection('documents');
    
    // If "all time", we need to aggregate differently since we only have total viewCount
    // For now, we'll use the uploadedAt date as a proxy for when views might have occurred
    // In a real system, you'd track views per day, but we'll distribute total views over time
    const allDocuments = await documents
      .find({
        isPublished: true,
        uploadedAt: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    // Group views by date
    // Since we don't have daily view tracking, we'll create a simple distribution
    // For documents published in the range, we'll show their viewCount on their publish date
    const viewsByDate = new Map<string, number>();

    // Initialize all dates in range with 0 views
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      viewsByDate.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add views from documents (on their publish date)
    allDocuments.forEach((doc) => {
      if (doc.uploadedAt) {
        const docDate = new Date(doc.uploadedAt);
        const dateKey = docDate.toISOString().split('T')[0];
        const currentViews = viewsByDate.get(dateKey) || 0;
        viewsByDate.set(dateKey, currentViews + (doc.viewCount || 0));
      }
    });

    // Convert to array and sort by date
    const result = Array.from(viewsByDate.entries())
      .map(([date, views]) => ({
        date,
        views,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching views over time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views over time' },
      { status: 500 }
    );
  }
}
