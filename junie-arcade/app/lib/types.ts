export type GameType = 'REFLEX_ARENA' | 'JUMP_MASTER' | 'MEMORY_MATCH'

export interface PlayerScore {
  id: string
  username: string
  score: number
  gameType: GameType
  accuracy?: number
  time?: number
  maxCombo?: number
  distance?: number
  createdAt: Date
}

export interface LeaderboardEntry {
  username: string
  score: number
  rank?: number
}
