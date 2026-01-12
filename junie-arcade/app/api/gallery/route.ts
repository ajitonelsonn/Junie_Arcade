import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const images = await prisma.galleryItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to 100 most recent images
    });

    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
  }
}
