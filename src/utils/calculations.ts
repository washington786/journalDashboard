/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Trade, TradeStats } from "../types/trade"


export const calculateStats = (trades: Trade[]): TradeStats | null => {
    if (!trades || trades.length === 0) return null

    const winningTrades = trades.filter(t => t.result > 0)
    const losingTrades = trades.filter(t => t.result < 0)

    const totalPnL = trades.reduce((sum, trade) => sum + trade.result, 0)
    const avgWin = winningTrades.length > 0
        ? winningTrades.reduce((sum, trade) => sum + trade.result, 0) / winningTrades.length
        : 0
    const avgLoss = losingTrades.length > 0
        ? losingTrades.reduce((sum, trade) => sum + trade.result, 0) / losingTrades.length
        : 0

    const winRate = trades.length > 0
        ? (winningTrades.length / trades.length) * 100
        : 0

    const avgRR = trades.length > 0
        ? trades.reduce((sum, trade) => sum + (trade.rrRatio || 0), 0) / trades.length
        : 0

    // Recent performance (last 10 trades)
    const recentTrades = trades.slice(-10)
    const recentWinning = recentTrades.filter(t => t.result > 0)
    const recentWinRate = recentTrades.length > 0
        ? (recentWinning.length / recentTrades.length) * 100
        : 0

    // Strategy statistics
    const strategyStats: Record<string, any> = trades.reduce((acc, trade) => {
        const strategy = trade.strategy || 'Unknown'
        if (!acc[strategy]) {
            acc[strategy] = { wins: 0, losses: 0, total: 0, pnl: 0 }
        }

        acc[strategy].total += 1
        acc[strategy].pnl += trade.result

        if (trade.result > 0) {
            acc[strategy].wins += 1
        } else {
            acc[strategy].losses += 1
        }

        return acc
    }, {} as Record<string, any>)

    // Add win rates to strategy stats
    Object.keys(strategyStats).forEach(strategy => {
        const stats = strategyStats[strategy]
        stats.winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0
        stats.count = stats.total
    })

    // Max drawdown calculation
    let peak = 0
    let maxDrawdown = 0
    let runningTotal = 0

    trades.forEach(trade => {
        runningTotal += trade.result
        peak = Math.max(peak, runningTotal)
        const drawdown = peak - runningTotal
        maxDrawdown = Math.max(maxDrawdown, drawdown)
    })

    // Consecutive wins/losses
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentWins = 0
    let currentLosses = 0

    trades.forEach(trade => {
        if (trade.result > 0) {
            currentWins++
            currentLosses = 0
            maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins)
        } else {
            currentLosses++
            currentWins = 0
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses)
        }
    })

    // Sharpe ratio (simplified)
    const returns = trades.map(t => t.result)
    const avgReturn = returns.length > 0
        ? returns.reduce((sum, r) => sum + r, 0) / returns.length
        : 0
    const stdDev = returns.length > 1
        ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
        : 0
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0

    return {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        totalPnL,
        avgWin,
        avgLoss,
        winRate,
        avgRR,
        recentWinRate,
        strategyStats,
        maxDrawdown,
        maxConsecutiveWins,
        maxConsecutiveLosses,
        sharpeRatio
    }
}