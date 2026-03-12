import { useState, useEffect } from 'react'

interface Stats {
    totalPlayers: number
    totalCountries: number
}

interface UseStatsReturn {
    stats: Stats | null
    loading: boolean
    error: string | null
}

export function useStats(): UseStatsReturn {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('/api/stats', {
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch statistics')
                }

                const data = await response.json()

                if (data.success) {
                    setStats(data.data)
                } else {
                    throw new Error(data.error || 'Failed to fetch statistics')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { stats, loading, error }
}