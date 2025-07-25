import React, { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    LinearProgress,
    Alert
} from '@mui/material'
import {
    TrendingUp,
    TrendingDown,
    AccountBalanceWallet,
    ShowChart
} from '@mui/icons-material'
import { useTrades } from '../hooks/useTrades'
import { calculateStats } from '../utils/calculations'
import type { TradeStats } from '../types/trade'


const Dashboard = () => {
    const { trades, loading } = useTrades()
    const [stats, setStats] = useState<TradeStats | null>(null)

    useEffect(() => {
        if (trades) {
            setStats(calculateStats(trades))
        }
    }, [trades])

    if (loading) {
        return <Typography>Loading...</Typography>
    }

    if (!stats) {
        return <Alert severity="info">No trades yet. Add your first trade!</Alert>
    }

    const StatCard = ({
        title,
        value,
        icon,
        color = 'primary',
        trend
    }: {
        title: string
        value: string
        icon: React.ReactNode
        color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
        trend?: number
    }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" component="div" color={typeof color === 'string' ? `${color}.main` : color}>
                    {value}
                </Typography>
                {trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                        <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    )

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Performance Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                    <StatCard
                        title="Win Rate"
                        value={`${stats.winRate.toFixed(1)}%`}
                        icon={<ShowChart />}
                        color={stats.winRate >= 50 ? 'success' : 'error'}
                        trend={stats.winRate - 50}
                    />
                </Box>

                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                    <StatCard
                        title="Total P&L"
                        value={`$${stats.totalPnL.toFixed(2)}`}
                        icon={<AccountBalanceWallet />}
                        color={stats.totalPnL >= 0 ? 'success' : 'error'}
                        trend={stats.totalPnL}
                    />
                </Box>

                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                    <StatCard
                        title="Avg Win"
                        value={`$${stats.avgWin.toFixed(2)}`}
                        icon={<TrendingUp />}
                        color="success"
                    />
                </Box>

                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                    <StatCard
                        title="Avg Loss"
                        value={`$${Math.abs(stats.avgLoss).toFixed(2)}`}
                        icon={<TrendingDown />}
                        color="error"
                    />
                </Box>
            </Box>

            {/* Recent Performance and Quick Stats */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ width: { xs: '100%', md: '65%' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Performance
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Last 10 Trades: {stats.recentWinRate.toFixed(1)}% Win Rate
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.recentWinRate}
                                    color={stats.recentWinRate >= 50 ? 'success' : 'error'}
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Stats
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                                <Chip
                                    label={`Total Trades: ${stats.totalTrades}`}
                                    color="primary"
                                    size="small"
                                    sx={{ mr: 1, mb: 1 }}
                                />
                                <Chip
                                    label={`Winning: ${stats.winningTrades}`}
                                    color="success"
                                    size="small"
                                    sx={{ mr: 1, mb: 1 }}
                                />
                                <Chip
                                    label={`Losing: ${stats.losingTrades}`}
                                    color="error"
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                            </Box>
                            <Typography variant="body2">
                                Risk/Reward: {stats.avgRR.toFixed(2)}:1
                            </Typography>
                            <Typography variant="body2">
                                Max Drawdown: ${stats.maxDrawdown.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Strategy Performance */}
            <Box sx={{ width: '100%' }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Strategy Performance
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {Object.entries(stats.strategyStats).map(([strategy, stat]) => (
                                <Box
                                    key={strategy}
                                    sx={{
                                        width: { xs: '100%', sm: '48%', md: '23%' },
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 1
                                    }}
                                >
                                    <Typography variant="subtitle2">{strategy}</Typography>
                                    <Typography variant="h6" color={stat.winRate >= 50 ? 'success.main' : 'error.main'}>
                                        {stat.winRate.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2">
                                        {stat.count} trades
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}

export default Dashboard