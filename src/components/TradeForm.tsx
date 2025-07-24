import React, { useState } from 'react'
import {
    Card,
    CardContent,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
    Box,
    Alert,
    Snackbar,
    SelectChangeEvent
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useTrades } from '../hooks/useTrades'
import { TradeFormData, Trade } from '../types/trade'

const TradeForm = () => {
    const { addTrade } = useTrades()
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
    const [formData, setFormData] = useState<TradeFormData>({
        date: new Date(),
        symbol: '',
        direction: 'long',
        entryPrice: '',
        exitPrice: '',
        stopLoss: '',
        takeProfit: '',
        positionSize: '',
        riskAmount: '',
        result: '',
        rrRatio: '',
        strategy: '',
        timeframe: '1h',
        notes: '',
        emotion: 'neutral'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const tradeData: Trade = {
                ...formData,
                id: Date.now().toString(),
                entryPrice: parseFloat(formData.entryPrice),
                exitPrice: parseFloat(formData.exitPrice),
                stopLoss: parseFloat(formData.stopLoss),
                takeProfit: parseFloat(formData.takeProfit),
                positionSize: parseFloat(formData.positionSize),
                riskAmount: parseFloat(formData.riskAmount),
                result: parseFloat(formData.result),
                rrRatio: parseFloat(formData.rrRatio)
            }

            await addTrade(tradeData)

            setSnackbar({
                open: true,
                message: 'Trade added successfully!',
                severity: 'success'
            })

            // Reset form
            setFormData({
                date: new Date(),
                symbol: '',
                direction: 'long',
                entryPrice: '',
                exitPrice: '',
                stopLoss: '',
                takeProfit: '',
                positionSize: '',
                riskAmount: '',
                result: '',
                rrRatio: '',
                strategy: '',
                timeframe: '1h',
                notes: '',
                emotion: 'neutral'
            })
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: 'Error adding trade: ' + error.message,
                severity: 'error'
            })
        }
    }

    const handleChange = (field: keyof TradeFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleInputChange = (field: keyof TradeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(field, e.target.value)
    }

    const handleSelectChange = (field: keyof TradeFormData) => (e: SelectChangeEvent) => {
        handleChange(field, e.target.value)
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        📝 Add New Trade
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Trade Date"
                                    value={formData.date}
                                    onChange={(newValue) => newValue && handleChange('date', newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Symbol"
                                    value={formData.symbol}
                                    onChange={handleInputChange('symbol')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Direction</InputLabel>
                                    <Select
                                        value={formData.direction}
                                        onChange={handleSelectChange('direction')}
                                    >
                                        <MenuItem value="long">📈 Long</MenuItem>
                                        <MenuItem value="short">📉 Short</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Timeframe</InputLabel>
                                    <Select
                                        value={formData.timeframe}
                                        onChange={handleSelectChange('timeframe')}
                                    >
                                        <MenuItem value="1m">1 Minute</MenuItem>
                                        <MenuItem value="5m">5 Minutes</MenuItem>
                                        <MenuItem value="15m">15 Minutes</MenuItem>
                                        <MenuItem value="1h">1 Hour</MenuItem>
                                        <MenuItem value="4h">4 Hours</MenuItem>
                                        <MenuItem value="1d">1 Day</MenuItem>
                                        <MenuItem value="1w">1 Week</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Price Levels */}
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Entry Price"
                                    type="number"
                                    step="0.0001"
                                    value={formData.entryPrice}
                                    onChange={handleInputChange('entryPrice')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Exit Price"
                                    type="number"
                                    step="0.0001"
                                    value={formData.exitPrice}
                                    onChange={handleInputChange('exitPrice')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Stop Loss"
                                    type="number"
                                    step="0.0001"
                                    value={formData.stopLoss}
                                    onChange={handleInputChange('stopLoss')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Take Profit"
                                    type="number"
                                    step="0.0001"
                                    value={formData.takeProfit}
                                    onChange={handleInputChange('takeProfit')}
                                />
                            </Grid>

                            {/* Risk Management */}
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Position Size"
                                    type="number"
                                    value={formData.positionSize}
                                    onChange={handleInputChange('positionSize')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Risk Amount ($)"
                                    type="number"
                                    step="0.01"
                                    value={formData.riskAmount}
                                    onChange={handleInputChange('riskAmount')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Risk/Reward Ratio"
                                    type="number"
                                    step="0.1"
                                    value={formData.rrRatio}
                                    onChange={handleInputChange('rrRatio')}
                                />
                            </Grid>

                            {/* Results */}
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Result ($)"
                                    type="number"
                                    step="0.01"
                                    value={formData.result}
                                    onChange={handleInputChange('result')}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Strategy</InputLabel>
                                    <Select
                                        value={formData.strategy}
                                        onChange={handleSelectChange('strategy')}
                                    >
                                        <MenuItem value="ema-rsi">EMA + RSI</MenuItem>
                                        <MenuItem value="price-action">Price Action</MenuItem>
                                        <MenuItem value="fibonacci">Fibonacci</MenuItem>
                                        <MenuItem value="breakout">Breakout</MenuItem>
                                        <MenuItem value="mean-reversion">Mean Reversion</MenuItem>
                                        <MenuItem value="scalping">Scalping</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Emotional State</InputLabel>
                                    <Select
                                        value={formData.emotion}
                                        onChange={handleSelectChange('emotion')}
                                    >
                                        <MenuItem value="confident">💪 Confident</MenuItem>
                                        <MenuItem value="neutral">😐 Neutral</MenuItem>
                                        <MenuItem value="nervous">😰 Nervous</MenuItem>
                                        <MenuItem value="greedy">💰 Greedy</MenuItem>
                                        <MenuItem value="fearful">😨 Fearful</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Notes */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    value={formData.notes}
                                    onChange={handleInputChange('notes')}
                                    placeholder="What went right/wrong? What did you learn?"
                                />
                            </Grid>

                            {/* Submit */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ py: 2 }}
                                >
                                    🎯 Add Trade to Journal
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                message={snackbar.message}
            />
        </LocalizationProvider>
    )
}

export default TradeForm