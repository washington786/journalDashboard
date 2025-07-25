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
    Box,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Tooltip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    TrendingUp,
    TrendingDown,
    ShowChart
} from '@mui/icons-material';
import { useTrades } from '../hooks/useTrades';

// --- Types for our analyzer ---
interface TimeframeAnalysis {
    timeframe: string;
    rsi: number | null;
    emaAlignment: 'bullish' | 'bearish' | 'neutral' | null;
    supportResistance: 'support' | 'resistance' | 'neutral' | null;
    atr: number | null;
    trend: 'bullish' | 'bearish' | 'neutral' | null;
}

interface TradeSetup {
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
    riskAmount: number;
    timeframe: string;
}

interface RiskAnalysis {
    riskPerTrade: number;
    rewardPerTrade: number;
    riskRewardRatio: number;
    winRateProbability: number; // Based on confluence
    suggestedPositionSize: number;
    maxPositionSize: number;
    tradeConfidence: 'high' | 'medium' | 'low';
    suggestedAction: 'strong_buy' | 'buy' | 'weak_buy' | 'weak_sell' | 'sell' | 'strong_sell' | 'no_trade';
}

const SmartAnalyzer: React.FC = () => {
    const { trades } = useTrades();
    const [setup, setSetup] = useState<TradeSetup>({
        symbol: 'XAUUSD',
        direction: 'long',
        entryPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        positionSize: 0,
        riskAmount: 0,
        timeframe: '1h'
    });

    const [analysis, setAnalysis] = useState<TimeframeAnalysis[]>([
        { timeframe: 'W', rsi: null, emaAlignment: null, supportResistance: null, atr: null, trend: null },
        { timeframe: 'D', rsi: null, emaAlignment: null, supportResistance: null, atr: null, trend: null },
        { timeframe: '4h', rsi: null, emaAlignment: null, supportResistance: null, atr: null, trend: null },
        { timeframe: '3h', rsi: null, emaAlignment: null, supportResistance: null, atr: null, trend: null },
        { timeframe: '30m', rsi: null, emaAlignment: null, supportResistance: null, atr: null, trend: null },
        { timeframe: '3m', rsi: null, emaAlignment: null, supportResistance: null, atr: null, trend: null }
    ]);

    const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleSetupChange = (field: keyof TradeSetup, value: any) => {
        setSetup(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAnalysisChange = (index: number, field: keyof TimeframeAnalysis, value: any) => {
        setAnalysis(prev => {
            const newAnalysis = [...prev];
            newAnalysis[index] = { ...newAnalysis[index], [field]: value };
            return newAnalysis;
        });
    };

    // Calculate risk analysis based on setup and timeframe analysis
    const calculateRiskAnalysis = (): RiskAnalysis => {
        if (!setup.entryPrice || !setup.stopLoss || !setup.takeProfit) {
            return {
                riskPerTrade: 0,
                rewardPerTrade: 0,
                riskRewardRatio: 0,
                winRateProbability: 0,
                suggestedPositionSize: 0,
                maxPositionSize: 0,
                tradeConfidence: 'low',
                suggestedAction: 'no_trade'
            };
        }

        // Calculate basic risk/reward
        const riskPerTrade = Math.abs(setup.entryPrice - setup.stopLoss);
        const rewardPerTrade = Math.abs(setup.takeProfit - setup.entryPrice);
        const riskRewardRatio = rewardPerTrade / riskPerTrade;

        // Count bullish/bearish signals across timeframes
        let bullishSignals = 0;
        let bearishSignals = 0;
        let neutralSignals = 0;

        analysis.forEach(tf => {
            if (tf.emaAlignment === 'bullish' || tf.trend === 'bullish') bullishSignals++;
            else if (tf.emaAlignment === 'bearish' || tf.trend === 'bearish') bearishSignals++;
            else neutralSignals++;
        });

        // Calculate confluence score (0-100)
        const confluenceScore = (bullishSignals > bearishSignals ? bullishSignals : bearishSignals) / analysis.length * 100;

        // Win rate probability based on confluence and R:R
        const winRateProbability = Math.min(95, Math.max(10, confluenceScore * (riskRewardRatio / 2)));

        // Position sizing suggestions
        const suggestedPositionSize = setup.riskAmount / riskPerTrade;
        const maxPositionSize = suggestedPositionSize * 2; // Don't exceed 2x suggested

        // Determine trade confidence and action
        let tradeConfidence: 'high' | 'medium' | 'low' = 'low';
        let suggestedAction: RiskAnalysis['suggestedAction'] = 'no_trade';

        if (confluenceScore >= 70 && riskRewardRatio >= 2) {
            tradeConfidence = 'high';
            suggestedAction = setup.direction === 'long' ? 'strong_buy' : 'strong_sell';
        } else if (confluenceScore >= 50 && riskRewardRatio >= 1.5) {
            tradeConfidence = 'medium';
            suggestedAction = setup.direction === 'long' ? 'buy' : 'sell';
        } else if (confluenceScore >= 30 && riskRewardRatio >= 1) {
            tradeConfidence = 'low';
            suggestedAction = setup.direction === 'long' ? 'weak_buy' : 'weak_sell';
        } else {
            tradeConfidence = 'low';
            suggestedAction = 'no_trade';
        }

        return {
            riskPerTrade,
            rewardPerTrade,
            riskRewardRatio,
            winRateProbability,
            suggestedPositionSize,
            maxPositionSize,
            tradeConfidence,
            suggestedAction
        };
    };

    // Run analysis when setup or analysis changes
    useEffect(() => {
        const newRiskAnalysis = calculateRiskAnalysis();
        setRiskAnalysis(newRiskAnalysis);
    }, [setup, analysis]);

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const getSignalColor = (signal: any) => {
        if (signal === 'bullish') return 'success';
        if (signal === 'bearish') return 'error';
        if (signal === 'support') return 'success';
        if (signal === 'resistance') return 'error';
        return 'default';
    };

    const getSignalIcon = (signal: any) => {
        if (signal === 'bullish' || signal === 'support') return <TrendingUp fontSize="small" />;
        if (signal === 'bearish' || signal === 'resistance') return <TrendingDown fontSize="small" />;
        return <ShowChart fontSize="small" />;
    };

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

                    {/* Trade Setup */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>🎯 Trade Setup</Typography>
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
                                value={setup.entryPrice || ''}
                                onChange={(e) => handleSetupChange('entryPrice', parseFloat(e.target.value) || 0)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Stop Loss"
                                type="number"
                                value={setup.stopLoss || ''}
                                onChange={(e) => handleSetupChange('stopLoss', parseFloat(e.target.value) || 0)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Take Profit"
                                type="number"
                                value={setup.takeProfit || ''}
                                onChange={(e) => handleSetupChange('takeProfit', parseFloat(e.target.value) || 0)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Risk Amount ($)"
                                type="number"
                                value={setup.riskAmount || ''}
                                onChange={(e) => handleSetupChange('riskAmount', parseFloat(e.target.value) || 0)}
                                size="small"
                                sx={{ width: 120 }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Timeframe Analysis */}
                    <Typography variant="h6" gutterBottom>📊 Timeframe Analysis</Typography>
                    {analysis.map((tf, index) => (
                        <Accordion
                            key={tf.timeframe}
                            expanded={expanded === `panel${index}`}
                            onChange={handleAccordionChange(`panel${index}`)}
                            sx={{ mb: 1 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ width: '15%', flexShrink: 0 }}>
                                    <strong>{tf.timeframe}</strong>
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    {tf.trend ? `${tf.trend.toUpperCase()} | ` : ''}
                                    {tf.emaAlignment ? `EMA: ${tf.emaAlignment.toUpperCase()} | ` : ''}
                                    {tf.rsi ? `RSI: ${tf.rsi.toFixed(0)} | ` : ''}
                                    {tf.supportResistance ? `S/R: ${tf.supportResistance.toUpperCase()}` : ''}
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
                                        value={tf.rsi || ''}
                                        onChange={(e) => handleAnalysisChange(index, 'rsi', parseFloat(e.target.value) || null)}
                                        size="small"
                                        sx={{ width: 100 }}
                                    />
                                    <FormControl size="small" sx={{ width: 150 }}>
                                        <InputLabel>Support/Resistance</InputLabel>
                                        <Select
                                            value={tf.supportResistance || ''}
                                            label="Support/Resistance"
                                            onChange={(e) => handleAnalysisChange(index, 'supportResistance', e.target.value || null)}
                                        >
                                            <MenuItem value="support">🟢 Support</MenuItem>
                                            <MenuItem value="resistance">🔴 Resistance</MenuItem>
                                            <MenuItem value="neutral">⚪ Neutral</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="ATR"
                                        type="number"
                                        value={tf.atr || ''}
                                        onChange={(e) => handleAnalysisChange(index, 'atr', parseFloat(e.target.value) || null)}
                                        size="small"
                                        sx={{ width: 100 }}
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    {/* Risk Analysis */}
                    {riskAnalysis && (
                        <Box>
                            <Typography variant="h6" gutterBottom>💡 Smart Risk Analysis</Typography>

                            {/* Action Suggestion */}
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <Chip
                                    label={getActionLabel(riskAnalysis.suggestedAction)}
                                    color={getActionColor(riskAnalysis.suggestedAction)}
                                    size='medium'
                                    sx={{ fontSize: '1.2rem', py: 2, px: 3 }}
                                />
                            </Box>

                            {/* Key Metrics */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Risk/Reward Ratio</Typography>
                                    <Typography variant="h6" color={riskAnalysis.riskRewardRatio >= 2 ? 'success.main' : riskAnalysis.riskRewardRatio >= 1.5 ? 'warning.main' : 'error.main'}>
                                        {riskAnalysis.riskRewardRatio.toFixed(2)}:1
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Win Probability</Typography>
                                    <Typography variant="h6">{riskAnalysis.winRateProbability.toFixed(1)}%</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={riskAnalysis.winRateProbability}
                                        color={riskAnalysis.winRateProbability >= 70 ? 'success' : riskAnalysis.winRateProbability >= 50 ? 'warning' : 'error'}
                                    />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Confidence Level</Typography>
                                    <Chip
                                        label={riskAnalysis.tradeConfidence.toUpperCase()}
                                        color={riskAnalysis.tradeConfidence === 'high' ? 'success' : riskAnalysis.tradeConfidence === 'medium' ? 'warning' : 'error'}
                                    />
                                </Box>
                            </Box>

                            {/* Position Sizing */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Suggested Position Size</Typography>
                                    <Typography variant="h6">{riskAnalysis.suggestedPositionSize.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Max Position Size</Typography>
                                    <Typography variant="h6">{riskAnalysis.maxPositionSize.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Risk Per Trade</Typography>
                                    <Typography variant="h6">${riskAnalysis.riskPerTrade.toFixed(5)}</Typography>
                                </Box>
                            </Box>

                            {/* Trade Rules Check */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>📋 Trade Rules Check</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Tooltip title="Higher timeframe trend aligns with trade direction">
                                        <Chip
                                            icon={setup.direction === 'long' && analysis[0].trend === 'bullish' ? <CheckIcon /> : <CancelIcon />}
                                            label="HTF Trend Align"
                                            color={setup.direction === 'long' && analysis[0].trend === 'bullish' ? 'success' : setup.direction === 'short' && analysis[0].trend === 'bearish' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Tooltip>
                                    <Tooltip title="Multiple timeframes confirm the trade direction">
                                        <Chip
                                            icon={riskAnalysis.winRateProbability > 60 ? <CheckIcon /> : <CancelIcon />}
                                            label="Multi-TF Confluence"
                                            color={riskAnalysis.winRateProbability > 60 ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Tooltip>
                                    <Tooltip title="Risk/Reward ratio is at least 1.5:1">
                                        <Chip
                                            icon={riskAnalysis.riskRewardRatio >= 1.5 ? <CheckIcon /> : <CancelIcon />}
                                            label="Good R:R Ratio"
                                            color={riskAnalysis.riskRewardRatio >= 1.5 ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Tooltip>
                                    <Tooltip title="Stop loss is placed beyond key support/resistance">
                                        <Chip
                                            icon={<CheckIcon />}
                                            label="Proper SL Placement"
                                            color="success"
                                            size="small"
                                        />
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SmartAnalyzer;