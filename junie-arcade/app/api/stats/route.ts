import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { validateApiKey, rateLimit, getClientIp } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
    try {
        // Validate API key
        const authResult = validateApiKey(request)
        if (!authResult.valid) {
            return authResult.error
        }

        // Rate limiting: 30 requests per minute per IP
        const clientIp = getClientIp(request)
        const rateLimitResult = rateLimit(`stats:${clientIp}`, 30, 60000)
        if (!rateLimitResult.allowed) {
            return rateLimitResult.error
        }

        // Get total players count
        const totalPlayers = await prisma.player.count()

        // Get total countries count (distinct countries from players table)
        const totalCountries = await prisma.player.groupBy({
            by: ['country'],
            where: {
                country: {
                    not: null
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                totalPlayers,
                totalCountries: totalCountries.length
            }
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        )
    }
}