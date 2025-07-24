export interface Trade {
    id: string
    date: Date
    symbol: string
    direction: 'long' | 'short'
    entryPrice: number
    exitPrice: number
    stopLoss: number
    takeProfit: number
    positionSize: number
    riskAmount: number
    result: number
    rrRatio: number
    strategy: string
    timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
    notes: string
    emotion: 'confident' | 'neutral' | 'nervous' | 'greedy' | 'fearful'
}

export interface TradeFormData {
    date: Date
    symbol: string
    direction: 'long' | 'short'
    entryPrice: string
    exitPrice: string
    stopLoss: string
    takeProfit: string
    positionSize: string
    riskAmount: string
    result: string
    rrRatio: string
    strategy: string
    timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
    notes: string
    emotion: 'confident' | 'neutral' | 'nervous' | 'greedy' | 'fearful'
}

export interface TradeStats {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    totalPnL: number
    avgWin: number
    avgLoss: number
    winRate: number
    avgRR: number
    recentWinRate: number
    strategyStats: Record<string, StrategyStat>
    maxDrawdown: number
    maxConsecutiveWins: number
    maxConsecutiveLosses: number
    sharpeRatio: number
}

export interface StrategyStat {
    wins: number
    losses: number
    total: number
    pnl: number
    winRate: number
    count: number
}