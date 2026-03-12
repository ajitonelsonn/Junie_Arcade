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
        const rateLimitResult = rateLimit(`stats-countries:${clientIp}`, 30, 60000)
        if (!rateLimitResult.allowed) {
            return rateLimitResult.error
        }

        // Get player count by country, sorted by count descending
        const countriesWithPlayerCount = await prisma.player.groupBy({
            by: ['country'],
            where: {
                country: {
                    not: null
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        })

        // Transform the data to a more readable format
        const countryStats = countriesWithPlayerCount.map(item => ({
            country: item.country,
            playerCount: item._count.id
        }))

        return NextResponse.json({
            success: true,
            data: countryStats
        })
    } catch (error) {
        console.error('Error fetching country statistics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch country statistics' },
            { status: 500 }
        )
    }
}