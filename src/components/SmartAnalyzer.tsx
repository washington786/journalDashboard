/* eslint-disable @typescript-eslint/no-unused-vars */
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
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    TrendingUp,
    TrendingDown,
    ShowChart
} from '@mui/icons-material';

// --- Types for our analyzer ---
interface TimeframeAnalysis {
    timeframe: string;
    trend: 'bullish' | 'bearish' | 'neutral' | null;
    emaAlignment: 'bullish' | 'bearish' | 'neutral' | null;
    rsi: number | null;
}

interface TradeSetup {
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: number | null;
    stopLoss: number | null;
    takeProfit: number | null;
    // User inputs their desired risk amount
    desiredRiskAmount: number | null;
}

interface RiskAnalysis {
    // What we calculate for the user
    riskPerUnit: number | null;
    rewardPerUnit: number | null;
    riskRewardRatio: number | null;
    calculatedPositionSize: number | null;
    potentialReward: number | null;
    // Our smart suggestion
    suggestedAction: 'strong_buy' | 'buy' | 'weak_buy' | 'weak_sell' | 'sell' | 'strong_sell' | 'no_trade';
    confidenceLevel: 'high' | 'medium' | 'low';
    winProbability: number | null;
}

const SmartAnalyzer: React.FC = () => {
    const [setup, setSetup] = useState<TradeSetup>({
        symbol: 'XAUUSD',
        direction: 'long',
        entryPrice: null,
        stopLoss: null,
        takeProfit: null,
        desiredRiskAmount: null // User fills this in
    });

    const [analysis, setAnalysis] = useState<TimeframeAnalysis[]>([
        { timeframe: 'W', trend: null, emaAlignment: null, rsi: null },
        { timeframe: 'D', trend: null, emaAlignment: null, rsi: null },
        { timeframe: '4h', trend: null, emaAlignment: null, rsi: null },
        { timeframe: '1h', trend: null, emaAlignment: null, rsi: null }
    ]);

    const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis>({
        riskPerUnit: null,
        rewardPerUnit: null,
        riskRewardRatio: null,
        calculatedPositionSize: null,
        potentialReward: null,
        suggestedAction: 'no_trade',
        confidenceLevel: 'low',
        winProbability: null
    });

    // Handle changes to the main trade setup
    const handleSetupChange = (field: keyof TradeSetup, value: any) => {
        // For number fields, convert empty string to null
        const processedValue = (field === 'entryPrice' || field === 'stopLoss' || field === 'takeProfit' || field === 'desiredRiskAmount')
            ? (value === '' ? null : Number(value))
            : value;

        setSetup(prev => ({
            ...prev,
            [field]: processedValue
        }));
    };

    // Handle changes to timeframe analysis
    const handleAnalysisChange = (index: number, field: keyof TimeframeAnalysis, value: any) => {
        // For RSI, convert empty string to null
        const processedValue = field === 'rsi' ? (value === '' ? null : Number(value)) : value;

        setAnalysis(prev => {
            const newAnalysis = [...prev];
            newAnalysis[index] = { ...newAnalysis[index], [field]: processedValue };
            return newAnalysis;
        });
    };

    // Calculate risk analysis whenever setup changes
    useEffect(() => {
        if (setup.entryPrice === null || setup.stopLoss === null || setup.takeProfit === null || setup.desiredRiskAmount === null) {
            // Reset if we don't have all the numbers
            setRiskAnalysis({
                riskPerUnit: null,
                rewardPerUnit: null,
                riskRewardRatio: null,
                calculatedPositionSize: null,
                potentialReward: null,
                suggestedAction: 'no_trade',
                confidenceLevel: 'low',
                winProbability: null
            });
            return;
        }

        // 1. Calculate Risk Per Unit (How much you risk per unit/contract)
        const riskPerUnit = Math.abs(setup.entryPrice - setup.stopLoss);

        // 2. Calculate Reward Per Unit (How much you make per unit/contract)
        const rewardPerUnit = Math.abs(setup.takeProfit - setup.entryPrice);

        // 3. Calculate Risk/Reward Ratio
        const riskRewardRatio = rewardPerUnit / riskPerUnit;

        // 4. Calculate Position Size (How many units/contracts to buy)
        const calculatedPositionSize = setup.desiredRiskAmount / riskPerUnit;

        // 5. Calculate Potential Reward (Total $ you could make)
        const potentialReward = calculatedPositionSize * rewardPerUnit;

        // 6. Smart Suggestion Logic (Simple for now)
        let suggestedAction: RiskAnalysis['suggestedAction'] = 'no_trade';
        let confidenceLevel: RiskAnalysis['confidenceLevel'] = 'low';
        let winProbability: number | null = null;

        // Count bullish/bearish signals from timeframe analysis
        let bullishSignals = 0;
        let bearishSignals = 0;

        analysis.forEach(tf => {
            if (tf.trend === 'bullish' || tf.emaAlignment === 'bullish') bullishSignals++;
            if (tf.trend === 'bearish' || tf.emaAlignment === 'bearish') bearishSignals++;
        });

        // Simple logic: if confluence + good R:R, suggest trade
        const isDirectionBullish = setup.direction === 'long';
        const isDirectionBearish = setup.direction === 'short';

        const htTrendBullish = analysis[0]?.trend === 'bullish'; // Weekly trend
        const htTrendBearish = analysis[0]?.trend === 'bearish';

        const confluenceBullish = bullishSignals > bearishSignals;
        const confluenceBearish = bearishSignals > bullishSignals;

        if (riskRewardRatio >= 2) { // Good risk/reward
            if (
                (isDirectionBullish && htTrendBullish && confluenceBullish) ||
                (isDirectionBearish && htTrendBearish && confluenceBearish)
            ) {
                suggestedAction = isDirectionBullish ? 'strong_buy' : 'strong_sell';
                confidenceLevel = 'high';
                winProbability = 80;
            } else if (
                (isDirectionBullish && (htTrendBullish || confluenceBullish)) ||
                (isDirectionBearish && (htTrendBearish || confluenceBearish))
            ) {
                suggestedAction = isDirectionBullish ? 'buy' : 'sell';
                confidenceLevel = 'medium';
                winProbability = 65;
            } else {
                suggestedAction = isDirectionBullish ? 'weak_buy' : 'weak_sell';
                confidenceLevel = 'low';
                winProbability = 40;
            }
        } else if (riskRewardRatio >= 1.5) {
            suggestedAction = isDirectionBullish ? 'weak_buy' : 'weak_sell';
            confidenceLevel = 'low';
            winProbability = 30;
        } else {
            suggestedAction = 'no_trade';
            confidenceLevel = 'low';
            winProbability = 10;
        }

        setRiskAnalysis({
            riskPerUnit,
            rewardPerUnit,
            riskRewardRatio,
            calculatedPositionSize,
            potentialReward,
            suggestedAction,
            confidenceLevel,
            winProbability
        });
    }, [setup, analysis]); // Re-calculate when setup or analysis changes

    // Helper functions for display
    const getActionColor = (action: RiskAnalysis['suggestedAction']) => {
        switch (action) {
            case 'strong_buy': return 'success';
            case 'buy': return 'info';
            case 'weak_buy': return 'warning';
            case 'weak_sell': return 'warning';
            case 'sell': return 'info';
            case 'strong_sell': return 'error';
            default: return 'default';
        }
    };

    const getActionLabel = (action: RiskAnalysis['suggestedAction']) => {
        switch (action) {
            case 'strong_buy': return '🚀 Strong Buy';
            case 'buy': return '✅ Buy';
            case 'weak_buy': return '⚠️ Weak Buy';
            case 'weak_sell': return '⚠️ Weak Sell';
            case 'sell': return '✅ Sell';
            case 'strong_sell': return '🚀 Strong Sell';
            default: return '❌ No Trade';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        🤖 Smart Top-Down Analyzer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enter your trade details and let Homie calculate your risk and suggest if it's a good trade!
                    </Typography>

                    {/* Trade Setup - Simple Inputs */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>🎯 Your Trade Setup</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <TextField
                                label="Symbol"
                                value={setup.symbol}
                                onChange={(e) => handleSetupChange('symbol', e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <FormControl size="small" sx={{ width: 120 }}>
                                <InputLabel>Direction</InputLabel>
                                <Select
                                    value={setup.direction}
                                    label="Direction"
                                    onChange={(e) => handleSetupChange('direction', e.target.value as 'long' | 'short')}
                                >
                                    <MenuItem value="long">📈 Long</MenuItem>
                                    <MenuItem value="short">📉 Short</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Entry Price"
                                type="number"
                                value={setup.entryPrice ?? ''}
                                onChange={(e) => handleSetupChange('entryPrice', e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Stop Loss"
                                type="number"
                                value={setup.stopLoss ?? ''}
                                onChange={(e) => handleSetupChange('stopLoss', e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Take Profit"
                                type="number"
                                value={setup.takeProfit ?? ''}
                                onChange={(e) => handleSetupChange('takeProfit', e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Risk Amount ($)"
                                type="number"
                                value={setup.desiredRiskAmount ?? ''}
                                onChange={(e) => handleSetupChange('desiredRiskAmount', e.target.value)}
                                size="small"
                                sx={{ width: 120 }}
                                helperText="How much $ do you want to risk?"
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Timeframe Analysis */}
                    <Typography variant="h6" gutterBottom>📊 Top-Down Analysis</Typography>
                    {analysis.map((tf, index) => (
                        <Accordion key={tf.timeframe} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ width: '15%', flexShrink: 0 }}>
                                    <strong>{tf.timeframe}</strong>
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    {tf.trend ? `Trend: ${tf.trend} | ` : ''}
                                    {tf.emaAlignment ? `EMA: ${tf.emaAlignment} | ` : ''}
                                    {tf.rsi ? `RSI: ${tf.rsi}` : ''}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    <FormControl size="small" sx={{ width: 150 }}>
                                        <InputLabel>Trend</InputLabel>
                                        <Select
                                            value={tf.trend || ''}
                                            label="Trend"
                                            onChange={(e) => handleAnalysisChange(index, 'trend', e.target.value || null)}
                                        >
                                            <MenuItem value="bullish">📈 Bullish</MenuItem>
                                            <MenuItem value="bearish">📉 Bearish</MenuItem>
                                            <MenuItem value="neutral">⏸️ Neutral</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ width: 150 }}>
                                        <InputLabel>EMA Alignment</InputLabel>
                                        <Select
                                            value={tf.emaAlignment || ''}
                                            label="EMA Alignment"
                                            onChange={(e) => handleAnalysisChange(index, 'emaAlignment', e.target.value || null)}
                                        >
                                            <MenuItem value="bullish">📈 Bullish</MenuItem>
                                            <MenuItem value="bearish">📉 Bearish</MenuItem>
                                            <MenuItem value="neutral">⏸️ Neutral</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="RSI"
                                        type="number"
                                        value={tf.rsi ?? ''}
                                        onChange={(e) => handleAnalysisChange(index, 'rsi', e.target.value)}
                                        size="small"
                                        sx={{ width: 100 }}
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    {/* Risk Analysis - Clear Calculations */}
                    <Typography variant="h6" gutterBottom>💡 Homie's Risk Calculation</Typography>

                    {/* Action Suggestion */}
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Chip
                            label={getActionLabel(riskAnalysis.suggestedAction)}
                            color={getActionColor(riskAnalysis.suggestedAction)}
                            size="medium"
                            sx={{ fontSize: '1.1rem', py: 2, px: 3 }}
                        />
                    </Box>

                    {/* Key Metrics - What Matters */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                        <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">Risk Per Unit</Typography>
                            <Typography variant="h6">
                                ${riskAnalysis.riskPerUnit?.toFixed(5) ?? '0.00000'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (Entry - Stop Loss)
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">R:R Ratio</Typography>
                            <Typography
                                variant="h6"
                                color={
                                    (riskAnalysis.riskRewardRatio ?? 0) >= 2 ? 'success.main' :
                                        (riskAnalysis.riskRewardRatio ?? 0) >= 1.5 ? 'warning.main' : 'error.main'
                                }
                            >
                                {(riskAnalysis.riskRewardRatio ?? 0).toFixed(2)}:1
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (Reward / Risk)
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 200, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">Position Size</Typography>
                            <Typography variant="h6">
                                {riskAnalysis.calculatedPositionSize?.toFixed(2) ?? '0.00'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (Risk Amount / Risk Per Unit)
                            </Typography>
                        </Box>
                    </Box>

                    {/* Potential Reward */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Potential Reward</Typography>
                        <Typography variant="h5" color="success.main">
                            ${riskAnalysis.potentialReward?.toFixed(2) ?? '0.00'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            (Position Size × Reward Per Unit)
                        </Typography>
                    </Box>

                    {/* Confidence & Probability */}
                    {riskAnalysis.winProbability !== null && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Win Probability</Typography>
                            <Typography variant="h6">{riskAnalysis.winProbability.toFixed(0)}%</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={riskAnalysis.winProbability}
                                color={
                                    riskAnalysis.winProbability >= 70 ? 'success' :
                                        riskAnalysis.winProbability >= 50 ? 'warning' : 'error'
                                }
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Confidence: <Chip
                                    label={riskAnalysis.confidenceLevel.toUpperCase()}
                                    color={
                                        riskAnalysis.confidenceLevel === 'high' ? 'success' :
                                            riskAnalysis.confidenceLevel === 'medium' ? 'warning' : 'error'
                                    }
                                    size="small"
                                />
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SmartAnalyzer;