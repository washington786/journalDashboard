/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
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
    Box,
    Snackbar
} from '@mui/material';
// Import SelectChangeEvent as a type
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTrades } from '../hooks/useTrades';
import type { TradeFormData, Trade } from '../types/trade';

// --- Predefined Options ---
const SYMBOL_OPTIONS = [
    'XAUUSD', 'XAUEUR', 'NAS100', 'US30', 'GER40',
    'XAGUSD', 'GBPUSD', 'EURUSD', 'USDCAD'
];

const TradeForm: React.FC = () => {
    const { addTrade } = useTrades();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [formData, setFormData] = useState<TradeFormData>({
        date: new Date(),
        symbol: '',
        direction: 'long',
        entryPrice: '',
        exitPrice: '', // Will be calculated or entered for closed trades
        stopLoss: '',
        takeProfit: '',
        positionSize: '', // Will be calculated
        riskAmount: '', // You enter this
        result: 'inprogress', // Default to in progress
        rrRatio: '', // Will be calculated
        strategy: '',
        timeframe: '1h',
        notes: '',
        emotion: 'neutral'
    });

    // --- AUTO-CALCULATIONS ---
    // Calculate Risk Per Unit (Entry - Stop Loss)
    const riskPerUnit = formData.entryPrice && formData.stopLoss
        ? Math.abs(parseFloat(formData.entryPrice) - parseFloat(formData.stopLoss))
        : 0;

    // Calculate Reward Per Unit (Take Profit - Entry)
    const rewardPerUnit = formData.takeProfit && formData.entryPrice
        ? Math.abs(parseFloat(formData.takeProfit) - parseFloat(formData.entryPrice))
        : 0;

    // Calculate R:R Ratio
    const rrRatioCalculated = riskPerUnit && rewardPerUnit
        ? (rewardPerUnit / riskPerUnit)
        : 0;

    // Calculate Position Size based on Risk Amount and Risk Per Unit
    const positionSizeCalculated = formData.riskAmount && riskPerUnit && parseFloat(formData.riskAmount) > 0 && riskPerUnit > 0
        ? parseFloat(formData.riskAmount) / riskPerUnit
        : 0;

    // Calculate Potential Reward based on Position Size and Reward Per Unit
    const potentialReward = positionSizeCalculated && rewardPerUnit
        ? positionSizeCalculated * rewardPerUnit
        : 0;

    // Update calculated fields in form state
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            rrRatio: rrRatioCalculated.toFixed(2),
            positionSize: positionSizeCalculated.toFixed(2)
        }));
    }, [rrRatioCalculated, positionSizeCalculated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Parse numeric fields, handling empty strings
            const parseOrZero = (value: string): number => value ? parseFloat(value) : 0;

            const tradeData: Trade = {
                ...formData,
                id: Date.now().toString(),
                date: formData.date,
                entryPrice: parseOrZero(formData.entryPrice),
                exitPrice: parseOrZero(formData.exitPrice),
                stopLoss: parseOrZero(formData.stopLoss),
                takeProfit: parseOrZero(formData.takeProfit),
                positionSize: parseOrZero(formData.positionSize),
                riskAmount: parseOrZero(formData.riskAmount),
                result: formData.result === 'inprogress' ? 0 : parseOrZero(formData.result), // Store 0 for inprogress
                rrRatio: parseOrZero(formData.rrRatio),
            };

            await addTrade(tradeData);

            setSnackbar({
                open: true,
                message: 'Trade added successfully!',
                severity: 'success'
            });

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
                result: 'inprogress',
                rrRatio: '',
                strategy: '',
                timeframe: '1h',
                notes: '',
                emotion: 'neutral'
            });
        } catch (error: any) {
            console.error("Error adding trade:", error);
            setSnackbar({
                open: true,
                message: 'Error adding trade: ' + (error.message || 'Unknown error'),
                severity: 'error'
            });
        }
    };

    const handleChange = (field: keyof TradeFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputChange = (field: keyof TradeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(field, e.target.value);
    };

    const handleSelectChange = (field: keyof TradeFormData) => (e: SelectChangeEvent) => {
        handleChange(field, e.target.value);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        📝 Add New Trade
                    </Typography>
                    <form onSubmit={handleSubmit} noValidate>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                            {/* Basic Info */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                    <DatePicker
                                        label="Trade Date"
                                        value={formData.date}
                                        onChange={(newValue) => newValue && handleChange('date', newValue)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="symbol-label">Symbol</InputLabel>
                                        <Select
                                            labelId="symbol-label"
                                            value={formData.symbol}
                                            label="Symbol"
                                            onChange={handleSelectChange('symbol')}
                                        >
                                            {SYMBOL_OPTIONS.map((sym) => (
                                                <MenuItem key={sym} value={sym}>{sym}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Direction</InputLabel>
                                        <Select
                                            value={formData.direction}
                                            label="Direction"
                                            onChange={handleSelectChange('direction')}
                                        >
                                            <MenuItem value="long">📈 Long</MenuItem>
                                            <MenuItem value="short">📉 Short</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Timeframe</InputLabel>
                                        <Select
                                            value={formData.timeframe}
                                            label="Timeframe"
                                            onChange={handleSelectChange('timeframe')}
                                        >
                                            <MenuItem value="1m">1 Minute</MenuItem>
                                            <MenuItem value="5m">5 Minutes</MenuItem>
                                            <MenuItem value="15m">15 Minutes</MenuItem>
                                            <MenuItem value="30m">30 Minutes</MenuItem>
                                            <MenuItem value="1h">1 Hour</MenuItem>
                                            <MenuItem value="3h">3 Hours</MenuItem>
                                            <MenuItem value="4h">4 Hours</MenuItem>
                                            <MenuItem value="1d">1 Day</MenuItem>
                                            <MenuItem value="1w">1 Week</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Price Levels & Risk Management */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                    <TextField
                                        fullWidth
                                        label="Entry Price"
                                        type="number"
                                        inputProps={{ step: "0.00001" }}
                                        value={formData.entryPrice}
                                        onChange={handleInputChange('entryPrice')}
                                    />
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                    <TextField
                                        fullWidth
                                        label="Stop Loss"
                                        type="number"
                                        inputProps={{ step: "0.00001" }}
                                        value={formData.stopLoss}
                                        onChange={handleInputChange('stopLoss')}
                                    />
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                    <TextField
                                        fullWidth
                                        label="Take Profit"
                                        type="number"
                                        inputProps={{ step: "0.00001" }}
                                        value={formData.takeProfit}
                                        onChange={handleInputChange('takeProfit')}
                                    />
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                    <TextField
                                        fullWidth
                                        label="Risk Amount ($)"
                                        type="number"
                                        inputProps={{ step: "1" }}
                                        value={formData.riskAmount}
                                        onChange={handleInputChange('riskAmount')}
                                        helperText="How much $ do you want to risk?"
                                    />
                                </Box>
                            </Box>

                            {/* AUTO-CALCULATED INFO */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                    <Typography variant="subtitle2" color="text.secondary">Risk Per Unit</Typography>
                                    <Typography variant="h6">${riskPerUnit.toFixed(5)}</Typography>
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                    <Typography variant="subtitle2" color="text.secondary">R:R Ratio</Typography>
                                    <Typography
                                        variant="h6"
                                        color={rrRatioCalculated >= 2 ? 'success.main' : rrRatioCalculated >= 1.5 ? 'warning.main' : 'error.main'}
                                    >
                                        {rrRatioCalculated.toFixed(2)}:1
                                    </Typography>
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                    <Typography variant="subtitle2" color="text.secondary">Position Size</Typography>
                                    <Typography variant="h6">{positionSizeCalculated.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                    <Typography variant="subtitle2" color="text.secondary">Potential Reward</Typography>
                                    <Typography variant="h6">${potentialReward.toFixed(2)}</Typography>
                                </Box>
                            </Box>

                            {/* Strategy & Result */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Strategy</InputLabel>
                                        <Select
                                            value={formData.strategy}
                                            label="Strategy"
                                            onChange={handleSelectChange('strategy')}
                                        >
                                            <MenuItem value="ema-rsi">EMA + RSI</MenuItem>
                                            <MenuItem value="price-action">Price Action</MenuItem>
                                            <MenuItem value="fibonacci">Fibonacci</MenuItem>
                                            <MenuItem value="breakout">Breakout</MenuItem>
                                            <MenuItem value="mean-reversion">Mean Reversion</MenuItem>
                                            <MenuItem value="scalping">Scalping</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Result</InputLabel>
                                        <Select
                                            value={formData.result}
                                            label="Result"
                                            onChange={handleSelectChange('result')}
                                        >
                                            <MenuItem value="inprogress">🔄 In Progress</MenuItem>
                                            <MenuItem value="win">✅ Win</MenuItem>
                                            <MenuItem value="loss">❌ Loss</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Notes */}
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    value={formData.notes}
                                    onChange={handleInputChange('notes')}
                                    placeholder="What went right/wrong? What did you learn?"
                                />
                            </Box>

                            {/* Submit */}
                            <Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ py: 2 }}
                                >
                                    🎯 Add Trade to Journal
                                </Button>
                            </Box>
                        </Box>
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
    );
};

export default TradeForm;