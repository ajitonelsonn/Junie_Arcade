import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      select: {
        name: true,
        code: true,
        flag: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}
