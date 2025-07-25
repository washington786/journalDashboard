/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react'; // Added useMemo
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
    Snackbar,
    FormControlLabel,
    Checkbox,
    Chip,
    LinearProgress,
    Divider
} from '@mui/material';
// Import SelectChangeEvent as a type
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTrades } from '../hooks/useTrades';
import type { TradeFormData, Trade } from '../types/trade';
import {
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon
} from '@mui/icons-material'; // Added icons

// --- Predefined Options ---
const SYMBOL_OPTIONS = [
    'XAUUSD', 'XAUEUR', 'NAS100', 'US30', 'GER40',
    'XAGUSD', 'GBPUSD', 'EURUSD', 'USDCAD'
];

const TIMEFRAME_OPTIONS = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '3h', label: '3 Hours' }, // Added 3h
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
];

const STRATEGY_OPTIONS = [
    { value: 'ema-rsi', label: 'EMA + RSI' },
    { value: 'price-action', label: 'Price Action' },
    { value: 'fibonacci', label: 'Fibonacci' },
    { value: 'breakout', label: 'Breakout' },
    { value: 'mean-reversion', label: 'Mean Reversion' },
    { value: 'scalping', label: 'Scalping' },
    { value: 'other', label: 'Other' }
];

const EMOTION_OPTIONS = [
    { value: 'confident', label: '💪 Confident' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'nervous', label: '😰 Nervous' },
    { value: 'greedy', label: '💰 Greedy' },
    { value: 'fearful', label: '😨 Fearful' },
];

const RESULT_OPTIONS = [
    { value: 'inprogress', label: '🔄 In Progress' },
    { value: 'win', label: '✅ Win' },
    { value: 'loss', label: '❌ Loss' },
];

// --- Trade Condition Types ---
type TradeConditionKey =
    | 'correctHtfTrend'      // Homie Rule #1
    | 'emaAlignment'         // Homie Rule #2
    | 'signalConfirmation'   // Homie Rule #3
    | 'keyLevelProximity'    // Homie Rule #4
    | 'rsiZone';             // Homie Rule #5

interface TradeConditions {
    correctHtfTrend: boolean;
    emaAlignment: boolean;
    signalConfirmation: boolean;
    keyLevelProximity: boolean;
    rsiZone: boolean;
}

const initialConditions: TradeConditions = {
    correctHtfTrend: false,
    emaAlignment: false,
    signalConfirmation: false,
    keyLevelProximity: false,
    rsiZone: false,
};

// --- Helper function to calculate risk metrics ---
const calculateRiskMetrics = (formData: TradeFormData) => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const sl = parseFloat(formData.stopLoss) || 0;
    const tp = parseFloat(formData.takeProfit) || 0;
    const riskAmount = parseFloat(formData.riskAmount) || 0;
    const positionSizeInput = parseFloat(formData.positionSize) || 0;

    if (entry <= 0 || sl <= 0 || riskAmount <= 0) {
        return {
            riskPerUnit: 0,
            rewardPerUnit: 0,
            riskRewardRatio: 0,
            calculatedPositionSize: 0,
            potentialReward: 0,
            isValid: false
        };
    }

    const riskPerUnit = Math.abs(entry - sl);
    const rewardPerUnit = tp > 0 ? Math.abs(tp - entry) : 0;
    const riskRewardRatio = rewardPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0;

    // Prefer user input position size, but calculate if not provided or zero
    let calculatedPositionSize = positionSizeInput;
    if (positionSizeInput <= 0) {
        calculatedPositionSize = riskAmount / riskPerUnit;
    }

    const potentialReward = calculatedPositionSize * rewardPerUnit;

    return {
        riskPerUnit,
        rewardPerUnit,
        riskRewardRatio,
        calculatedPositionSize,
        potentialReward,
        isValid: riskPerUnit > 0 && riskAmount > 0
    };
};

const TradeForm: React.FC = () => {
    const { addTrade } = useTrades();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [conditions, setConditions] = useState<TradeConditions>(initialConditions);

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
        result: 'inprogress', // Changed default to 'inprogress'
        rrRatio: '',
        strategy: '',
        timeframe: '1h',
        notes: '',
        emotion: 'neutral'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Calculate risk metrics using useMemo for performance ---
    const riskMetrics = useMemo(() => calculateRiskMetrics(formData), [formData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.symbol) newErrors.symbol = "Symbol is required";
        if (!formData.strategy) newErrors.strategy = "Strategy is required";
        if (!formData.entryPrice || isNaN(parseFloat(formData.entryPrice)) || parseFloat(formData.entryPrice) <= 0) newErrors.entryPrice = "Valid entry price is required";
        if (!formData.stopLoss || isNaN(parseFloat(formData.stopLoss)) || parseFloat(formData.stopLoss) <= 0) newErrors.stopLoss = "Valid stop loss is required";
        if (formData.takeProfit && (isNaN(parseFloat(formData.takeProfit)) || parseFloat(formData.takeProfit) <= 0)) newErrors.takeProfit = "Take profit must be a positive number";
        if (!formData.positionSize || isNaN(parseFloat(formData.positionSize)) || parseFloat(formData.positionSize) <= 0) newErrors.positionSize = "Valid position size is required";
        if (!formData.riskAmount || isNaN(parseFloat(formData.riskAmount)) || parseFloat(formData.riskAmount) <= 0) newErrors.riskAmount = "Valid risk amount is required";
        if (formData.result !== 'inprogress' && (!formData.exitPrice || isNaN(parseFloat(formData.exitPrice)) || parseFloat(formData.exitPrice) <= 0)) {
            newErrors.exitPrice = "Exit price is required for completed trades";
        }
        if (formData.result !== 'inprogress' && (!formData.rrRatio || isNaN(parseFloat(formData.rrRatio)) || parseFloat(formData.rrRatio) <= 0)) {
            newErrors.rrRatio = "R:R ratio is required for completed trades";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: 'Please fix the errors in the form.',
                severity: 'error'
            });
            return;
        }

        try {
            // Parse numeric fields, handling empty strings
            const parseOrZero = (value: string): number => value ? parseFloat(value) : 0;

            // Format conditions for notes
            const confirmedConditions = Object.entries(conditions)
                .filter(([, checked]) => checked)
                .map(([key]) => `- ${key}`)
                .join('\n');

            const notesWithConditions = confirmedConditions
                ? `${formData.notes}\n\nSetup Conditions Confirmed:\n${confirmedConditions}`
                : formData.notes;

            const tradeData: Trade = {
                ...formData,
                id: Date.now().toString(),
                date: formData.date,
                entryPrice: parseOrZero(formData.entryPrice),
                exitPrice: parseOrZero(formData.exitPrice),
                stopLoss: parseOrZero(formData.stopLoss),
                takeProfit: parseOrZero(formData.takeProfit),
                positionSize: riskMetrics.calculatedPositionSize, // Use calculated position size
                riskAmount: parseOrZero(formData.riskAmount),
                result: formData.result === 'inprogress' ? 0 : parseOrZero(formData.result),
                rrRatio: riskMetrics.riskRewardRatio, // Use calculated R:R
                notes: notesWithConditions.trim()
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
            setConditions(initialConditions);
            setErrors({});
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
        // Clear error when user starts typing/selecting
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleInputChange = (field: keyof TradeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(field, e.target.value);
    };

    const handleSelectChange = (field: keyof TradeFormData) => (e: SelectChangeEvent) => {
        handleChange(field, e.target.value);
    };

    const handleConditionChange = (condition: TradeConditionKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setConditions(prev => ({
            ...prev,
            [condition]: e.target.checked
        }));
    };

    // Helper to get error state for a field
    const isError = (fieldName: string): boolean => Boolean(errors[fieldName]);
    const getHelperText = (fieldName: string): string => errors[fieldName] || '';

    // --- Confirmation Logic ---
    const getConfirmationStatus = () => {
        const entry = parseFloat(formData.entryPrice) || 0;
        const sl = parseFloat(formData.stopLoss) || 0;
        const riskAmount = parseFloat(formData.riskAmount) || 0;

        const isValidSetup = entry > 0 && sl > 0 && riskAmount > 0;
        const isRRGood = riskMetrics.riskRewardRatio >= 2;
        const areConditionsMet = Object.values(conditions).some(v => v); // At least one condition checked
        const allConditionsMet = Object.values(conditions).every(v => v); // All conditions checked

        let overallStatus: 'ready' | 'almost' | 'not_ready' | 'invalid' = 'not_ready';
        let statusMessage = 'Fill in trade details';
        let statusColor: 'success' | 'warning' | 'error' | 'info' = 'info';

        if (!isValidSetup) {
            overallStatus = 'invalid';
            statusMessage = 'Invalid setup (Entry, SL, Risk)';
            statusColor = 'error';
        } else if (allConditionsMet && isRRGood) {
            overallStatus = 'ready';
            statusMessage = '✅ Trade Ready!';
            statusColor = 'success';
        } else if (areConditionsMet && isRRGood) {
            overallStatus = 'almost';
            statusMessage = '⚠️ Almost Ready';
            statusColor = 'warning';
        } else if (isValidSetup) {
            overallStatus = 'not_ready';
            statusMessage = 'Review setup';
            statusColor = 'info';
        }

        return { overallStatus, statusMessage, statusColor, isValidSetup, isRRGood, areConditionsMet, allConditionsMet };
    };

    const confirmation = getConfirmationStatus();

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        📝 Add New Trade
                    </Typography>
                    {/* Main Content Area - Two Columns */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
                        {/* Left Column - Trade Form (70%) */}
                        <Box sx={{ flex: { xs: 1, md: 7 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <form onSubmit={handleSubmit} noValidate>
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
                                        <FormControl fullWidth error={isError('symbol')}>
                                            <InputLabel id="symbol-label">Symbol *</InputLabel>
                                            <Select
                                                labelId="symbol-label"
                                                value={formData.symbol}
                                                label="Symbol *"
                                                onChange={handleSelectChange('symbol')}
                                            >
                                                {SYMBOL_OPTIONS.map((sym) => (
                                                    <MenuItem key={sym} value={sym}>{sym}</MenuItem>
                                                ))}
                                            </Select>
                                            {isError('symbol') && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>{errors.symbol}</Box>}
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
                                                {TIMEFRAME_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                {/* Price Levels */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                        <TextField
                                            fullWidth
                                            label="Entry Price *"
                                            type="number"
                                            inputProps={{ step: "0.00001" }} // More flexible step
                                            value={formData.entryPrice}
                                            onChange={handleInputChange('entryPrice')}
                                            error={isError('entryPrice')}
                                            helperText={getHelperText('entryPrice')}
                                            required
                                        />
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                        <TextField
                                            fullWidth
                                            label="Exit Price"
                                            type="number"
                                            inputProps={{ step: "0.00001" }}
                                            value={formData.exitPrice}
                                            onChange={handleInputChange('exitPrice')}
                                            error={isError('exitPrice')}
                                            helperText={getHelperText('exitPrice') || (formData.result !== 'inprogress' ? "Required for completed trades" : "")}
                                            disabled={formData.result === 'inprogress'}
                                        />
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '23%' } }}>
                                        <TextField
                                            fullWidth
                                            label="Stop Loss *"
                                            type="number"
                                            inputProps={{ step: "0.00001" }}
                                            value={formData.stopLoss}
                                            onChange={handleInputChange('stopLoss')}
                                            error={isError('stopLoss')}
                                            helperText={getHelperText('stopLoss')}
                                            required
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
                                            error={isError('takeProfit')}
                                            helperText={getHelperText('takeProfit')}
                                        />
                                    </Box>
                                </Box>

                                {/* Risk Management */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                        <TextField
                                            fullWidth
                                            label="Position Size *"
                                            type="number"
                                            inputProps={{ step: "0.01" }}
                                            value={formData.positionSize}
                                            onChange={handleInputChange('positionSize')}
                                            error={isError('positionSize')}
                                            helperText={getHelperText('positionSize') || `Calculated: ${riskMetrics.calculatedPositionSize.toFixed(2)}`}
                                            required
                                        />
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                        <TextField
                                            fullWidth
                                            label="Risk Amount ($) *"
                                            type="number"
                                            inputProps={{ step: "0.01" }}
                                            value={formData.riskAmount}
                                            onChange={handleInputChange('riskAmount')}
                                            error={isError('riskAmount')}
                                            helperText={getHelperText('riskAmount')}
                                            required
                                        />
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                        <TextField
                                            fullWidth
                                            label="Risk/Reward Ratio"
                                            type="number"
                                            inputProps={{ step: "0.1" }}
                                            value={formData.rrRatio} // This will be overwritten by calculated value on submit
                                            onChange={handleInputChange('rrRatio')}
                                            error={isError('rrRatio')}
                                            helperText={getHelperText('rrRatio') || (formData.result !== 'inprogress' ? "Required for completed trades" : `Calculated: ${riskMetrics.riskRewardRatio.toFixed(2)}`)}
                                            disabled={formData.result === 'inprogress'}
                                        />
                                    </Box>
                                </Box>

                                {/* Results & Strategy & Emotion */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                        <FormControl fullWidth error={isError('result')}>
                                            <InputLabel>Result</InputLabel>
                                            <Select
                                                value={formData.result}
                                                label="Result"
                                                onChange={handleSelectChange('result')}
                                            >
                                                {RESULT_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                            {isError('result') && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>{errors.result}</Box>}
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                        <FormControl fullWidth error={isError('strategy')}>
                                            <InputLabel id="strategy-label">Strategy *</InputLabel>
                                            <Select
                                                labelId="strategy-label"
                                                value={formData.strategy}
                                                label="Strategy *"
                                                onChange={handleSelectChange('strategy')}
                                            >
                                                {STRATEGY_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                            {isError('strategy') && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>{errors.strategy}</Box>}
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '32%' } }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Emotional State</InputLabel>
                                            <Select
                                                value={formData.emotion}
                                                label="Emotional State"
                                                onChange={handleSelectChange('emotion')}
                                            >
                                                {EMOTION_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                {/* Trade Conditions Checklist */}
                                <Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        ✅ Trade Setup Conditions (Homie's Rules)
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={conditions.correctHtfTrend}
                                                        onChange={handleConditionChange('correctHtfTrend')}
                                                        name="correctHtfTrend"
                                                    />
                                                }
                                                label="1. Correct HTF Trend"
                                            />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox // Fixed the typo from CheckBox to Checkbox
                                                        checked={conditions.emaAlignment}
                                                        onChange={handleConditionChange('emaAlignment')}
                                                        name="emaAlignment"
                                                    />
                                                }
                                                label="2. EMA Alignment"
                                            />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox // Fixed the typo from CheckBox to Checkbox
                                                        checked={conditions.signalConfirmation}
                                                        onChange={handleConditionChange('signalConfirmation')}
                                                        name="signalConfirmation"
                                                    />
                                                }
                                                label="3. Signal Confirmation"
                                            />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={conditions.keyLevelProximity}
                                                        onChange={handleConditionChange('keyLevelProximity')}
                                                        name="keyLevelProximity"
                                                    />
                                                }
                                                label="4. Near Key Level"
                                            />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={conditions.rsiZone}
                                                        onChange={handleConditionChange('rsiZone')}
                                                        name="rsiZone"
                                                    />
                                                }
                                                label="5. RSI in Correct Zone"
                                            />
                                        </Box>
                                    </Box>
                                    <Divider sx={{ mt: 2 }} />
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
                                        disabled={!confirmation.isValidSetup} // Disable if basic setup is invalid
                                    >
                                        🎯 Add Trade to Journal
                                    </Button>
                                </Box>
                            </form>
                        </Box>

                        {/* Right Column - Confirmation Panel (30%) */}
                        <Box sx={{
                            flex: { xs: 1, md: 3 },
                            minWidth: { xs: '100%', md: '300px' },
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="h6" gutterBottom align="center">
                                📊 Trade Confirmation
                            </Typography>

                            {/* Overall Status */}
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <Chip
                                    label={confirmation.statusMessage}
                                    color={confirmation.statusColor}
                                    size="medium"
                                    sx={{ fontSize: '1rem', py: 1, px: 2 }}
                                />
                            </Box>

                            {/* Risk Metrics Summary */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Risk Metrics
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2">Risk/Unit:</Typography>
                                    <Typography variant="body2" color={confirmation.isValidSetup ? "text.primary" : "text.disabled"}>
                                        ${riskMetrics.riskPerUnit.toFixed(5)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2">R:R Ratio:</Typography>
                                    <Typography
                                        variant="body2"
                                        color={
                                            riskMetrics.riskRewardRatio >= 2 ? 'success.main' :
                                                riskMetrics.riskRewardRatio >= 1.5 ? 'warning.main' : 'error.main'
                                        }
                                    >
                                        {riskMetrics.riskRewardRatio.toFixed(2)}:1
                                        {riskMetrics.riskRewardRatio >= 2 ? ' ✅' : riskMetrics.riskRewardRatio >= 1.5 ? ' ⚠️' : ' ❌'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2">Position Size:</Typography>
                                    <Typography variant="body2">
                                        {riskMetrics.calculatedPositionSize.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2">Potential Reward:</Typography>
                                    <Typography variant="body2" color="success.main">
                                        ${riskMetrics.potentialReward.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Conditions Check */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Setup Conditions
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2">Conditions Checked:</Typography>
                                    <Typography variant="body2">
                                        {Object.values(conditions).filter(v => v).length}/5
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(Object.values(conditions).filter(v => v).length / 5) * 100}
                                    color={
                                        Object.values(conditions).filter(v => v).length === 5 ? 'success' :
                                            Object.values(conditions).filter(v => v).length >= 3 ? 'warning' : 'error'
                                    }
                                    sx={{ my: 1 }}
                                />
                            </Box>

                            {/* Individual Conditions Status */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Condition Details
                                </Typography>
                                {Object.entries(conditions).map(([key, checked]) => (
                                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                        {checked ? (
                                            <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                        ) : (
                                            <CancelIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                                        )}
                                        <Typography variant="body2" color={checked ? 'success.main' : 'error.main'}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Quick Tips */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Quick Tips
                                </Typography>
                                {!confirmation.isValidSetup && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                        <WarningIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="error">
                                            Enter valid Entry, SL, and Risk Amount
                                        </Typography>
                                    </Box>
                                )}
                                {confirmation.isValidSetup && !confirmation.isRRGood && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                        <WarningIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="warning.main">
                                            Aim for R:R of 2:1 or higher
                                        </Typography>
                                    </Box>
                                )}
                                {confirmation.isValidSetup && confirmation.isRRGood && !confirmation.areConditionsMet && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                        <WarningIcon fontSize="small" color="info" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="info.main">
                                            Check your setup conditions
                                        </Typography>
                                    </Box>
                                )}
                                {confirmation.overallStatus === 'ready' && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                        <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="success.main">
                                            Setup looks good! Ready to trade.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
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