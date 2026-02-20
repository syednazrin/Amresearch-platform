import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function GET() {
  try {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { start, end } = getTodayRange();
    const views = await getCollection('document_views');

    const pipeline = [
      {
        $match: {
          viewedAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $hour: '$viewedAt' },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const byHour = await views.aggregate(pipeline).toArray();

    const hourMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourMap.set(h, 0);
    byHour.forEach((row: { _id: number; views: number }) => {
      hourMap.set(row._id, row.views);
    });

    const data = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h}:00`,
      views: hourMap.get(h) ?? 0,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching views today by hour:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views by hour' },
      { status: 500 }
    );
  }
}
