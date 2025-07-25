import {
    Card,
    CardContent,
    Typography,
    Box
} from '@mui/material'
import { useTrades } from '../hooks/useTrades'

const Statistics = () => {
    const { trades, loading } = useTrades()

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

    // Simple stats calculation
    const totalTrades = trades.length
    const winningTrades = trades.filter(t => t.result > 0).length
    const winRate = (winningTrades / totalTrades) * 100
    const totalPnL = trades.reduce((sum, trade) => sum + trade.result, 0)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        📊 Performance Analytics
                    </Typography>
                    <Typography variant="h6">
                        Total Trades: {totalTrades}
                    </Typography>
                    <Typography variant="h6">
                        Win Rate: {winRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="h6">
                        Total P&L: ${totalPnL.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}

export default Statistics