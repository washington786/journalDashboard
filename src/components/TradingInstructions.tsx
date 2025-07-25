/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    TrendingUp,
    TrendingDown,
    ShowChart
} from '@mui/icons-material';

const TradingInstructions = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                        🎯 Homie's Professional Trading Instructions
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {/* Entry Conditions */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', mb: 2 }}>
                            🚦 ENTRY CONDITIONS - THE HOMIE RULES
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            BUY SIGNAL CONDITIONS (All Must Be TRUE):
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 1. GREEN BACKGROUND (Higher Timeframe Trend UP)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 2. BLUE EMA ABOVE RED EMA (Current Trend UP)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 3. GREEN TRIANGLE UP appears (Price Action + RSI Confluence)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 4. Near SUPPORT Level (Red dots or Fibonacci levels)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 5. RSI between 30-50 (Not overbought)" />
                            </ListItem>
                        </List>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            SELL SIGNAL CONDITIONS (All Must Be TRUE):
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 1. RED BACKGROUND (Higher Timeframe Trend DOWN)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 2. BLUE EMA BELOW RED EMA (Current Trend DOWN)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 3. RED TRIANGLE DOWN appears (Price Action + RSI Confluence)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 4. Near RESISTANCE Level (Red dots or Fibonacci levels)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="✅ 5. RSI between 50-70 (Not oversold)" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* No Trade Conditions */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ color: '#dc004e', mb: 2 }}>
                            ⚠️ NO TRADE CONDITIONS - PROTECT YOUR ACCOUNT
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            NEVER TRADE WHEN:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="❌ NO TRADE #1: Gray Background (No Clear HTF Trend)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="❌ NO TRADE #2: Trading AGAINST the colored background" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="❌ NO TRADE #3: RSI > 70 (Overbought) for LONGS" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="❌ NO TRADE #4: RSI < 30 (Oversold) for SHORTS" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="❌ NO TRADE #5: No clear support/resistance nearby" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="❌ NO TRADE #6: ATR lines are too wide (High volatility)" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Risk Management */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ color: '#ff9800', mb: 2 }}>
                            💰 RISK MANAGEMENT - HOMIE'S GOLDEN RULES
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            STOP LOSS PLACEMENT:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><TrendingDown color="error" /></ListItemIcon>
                                <ListItemText primary="🔴 LONG TRADES: Place SL below recent swing low (Use red SL line on chart)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><TrendingUp color="error" /></ListItemIcon>
                                <ListItemText primary="🔴 SHORT TRADES: Place SL above recent swing high (Use red SL line on chart)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                                <ListItemText primary="🔴 Max 1.5% of account per trade" />
                            </ListItem>
                        </List>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            TAKE PROFIT STRATEGY:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><ShowChart color="success" /></ListItemIcon>
                                <ListItemText primary="🎯 TP1 (GREEN LINE): Quick 1:1 profit (Take 25-33%)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><ShowChart color="warning" /></ListItemIcon>
                                <ListItemText primary="🎯 TP2 (ORANGE LINE): Solid 1:2 profit (Take 25-33%)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><ShowChart color="info" /></ListItemIcon>
                                <ListItemText primary="🎯 TP3 (YELLOW LINE): Maximum 1:3 profit (Take remaining 33%)" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                                <ListItemText primary="💡 HOMIE TIP: Move SL to breakeven after TP1 hits!" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Golden Rules */}
                    <Box>
                        <Typography variant="h5" gutterBottom sx={{ color: '#9c27b0', mb: 2 }}>
                            💎 HOMIE'S GOLDEN RULES SUMMARY
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            <Chip label='"Trade WITH the background color"' color="primary" variant="outlined" />
                            <Chip label='"Wait for triangle + key level"' color="primary" variant="outlined" />
                            <Chip label='"Never risk more than 1-2%"' color="primary" variant="outlined" />
                            <Chip label='"Let winners run, cut losers quick"' color="primary" variant="outlined" />
                            <Chip label='"Patience > Action"' color="primary" variant="outlined" />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TradingInstructions;