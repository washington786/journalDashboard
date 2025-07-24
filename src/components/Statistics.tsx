import React, { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from '@mui/x-charts'
import { useTrades } from '../hooks/useTrades'
import { calculateStats } from '../utils/calculations'
import { TradeStats } from '../types/trade'

const Statistics = () => {
    const { trades, loading } = useTrades()
    const [activeTab, setActiveTab] = useState(0)
    const [timeRange, setTimeRange] = useState('all')
    const [stats, setStats] = useState<TradeStats | null>(null)

    useEffect(() => {
        if (trades) {
            setStats(calculateStats(trades))
        }
    }, [trades])

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    const handleTimeRangeChange = (event: any) => {
        setTimeRange(event.target.value)
    }

    if (loading) {
        return <Typography>Loading statistics...</Typography>
    }

    if (!trades || trades.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography>No trades to analyze yet.</Typography>
                </CardContent>
            </Card>
        )
    }

    // Prepare data for charts
    const equityCurveData = trades
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((acc: any[], trade, index) => {
            const cumulative = index === 0 ? trade.result : acc[index - 1].value + trade.result
            acc.push({
                date: new Date(trade.date).toLocaleDateString(),
                value: cumulative
            })
            return acc
        }, [])

    const strategyData = stats ? Object.entries(stats.strategyStats).map(([name, data]) => ({
        name,
        value: data.count,
        winRate: data.winRate
    })) : []

    const renderChartContent = () => {
        switch (activeTab) {
            case 0: // Equity Curve
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={equityCurveData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                name="Equity"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )

            case 1: // Strategy Performance
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={strategyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" name="Trades" />
                            <Bar dataKey="winRate" fill="#82ca9d" name="Win Rate %" />
                        </BarChart>
                    </ResponsiveContainer>
                )

            case 2: // Win/Loss Distribution
                const winLossData = [
                    { name: 'Wins', value: stats?.winningTrades || 0 },
                    { name: 'Losses', value: stats?.losingTrades || 0 }
                ]
                const COLORS = ['#00C49F', '#FF8042']

                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={winLossData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {winLossData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )

            default:
                return null
        }
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5">
                                📊 Performance Analytics
                            </Typography>
                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Time Range</InputLabel>
                                <Select
                                    value={timeRange}
                                    onChange={handleTimeRangeChange}
                                    label="Time Range"
                                >
                                    <MenuItem value="all">All Time</MenuItem>
                                    <MenuItem value="30">Last 30 Days</MenuItem>
                                    <MenuItem value="90">Last 90 Days</MenuItem>
                                    <MenuItem value="365">Last Year</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="Equity Curve" />
                            <Tab label="Strategy Analysis" />
                            <Tab label="Win/Loss Distribution" />
                        </Tabs>

                        <Box sx={{ mt: 3 }}>
                            {renderChartContent()}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Key Performance Metrics
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Sharpe Ratio</Typography>
                                    <Typography variant="h6">{stats?.sharpeRatio?.toFixed(2) || '0.00'}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Max Consecutive Wins</Typography>
                                    <Typography variant="h6">{stats?.maxConsecutiveWins || 0}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Max Consecutive Losses</Typography>
                                    <Typography variant="h6">{stats?.maxConsecutiveLosses || 0}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Avg Holding Time</Typography>
                                    <Typography variant="h6">{stats?.avgHoldingTime || '0'} hrs</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default Statistics