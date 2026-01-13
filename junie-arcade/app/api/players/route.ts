import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, country } = body

    if (!username || !country) {
      return NextResponse.json(
        { error: 'Username and country are required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.create({
      data: {
        username,
        country
      }
    })

    return NextResponse.json({ 
      success: true, 
      playerId: player.id,
      username: player.username,
      country: player.country
    })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}
