import { useState, useEffect } from 'react'

interface CountryStats {
    country: string
    playerCount: number
}

interface UseCountryStatsReturn {
    countryStats: CountryStats[]
    loading: boolean
    error: string | null
}

export function useCountryStats(): UseCountryStatsReturn {
    const [countryStats, setCountryStats] = useState<CountryStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCountryStats = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('/api/stats/countries', {
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch country statistics')
                }

                const data = await response.json()

                if (data.success) {
                    setCountryStats(data.data)
                } else {
                    throw new Error(data.error || 'Failed to fetch country statistics')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchCountryStats()
    }, [])

    return { countryStats, loading, error }
}