/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { useTrades } from '../hooks/useTrades';
import type { Trade } from '../types/trade';

const TradeList = () => {
    const { trades, loading, deleteTrade } = useTrades();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (loading) {
        return (
            <Box sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading trades...</Typography>
            </Box>
        );
    }

    if (!trades || trades.length === 0) {
        return (
            <Box sx={{ p: 3, height: '100%' }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Typography variant="h5" gutterBottom>
                            No trades recorded yet.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            Add your first trade using the "New Trade" form.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Pagination
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewTrade = (trade: Trade) => {
        setSelectedTrade(trade);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTrade(null);
    };

    // Format date for display
    const formatDate = (dateString: Date) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Get paginated trades
    const paginatedTrades = trades.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Card sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Typography variant="h5" gutterBottom>
                        📋 Trade History
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Total trades: {trades.length}
                    </Typography>

                    <Box sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0 // This is important for flexbox scrolling
                    }}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                flexGrow: 1,
                                minHeight: 0 // This allows the table to scroll if needed
                            }}
                        >
                            <Table
                                sx={{
                                    minWidth: 650,
                                    width: '100%' // Ensure full width
                                }}
                                aria-label="trades table"
                                stickyHeader // Makes header stick when scrolling
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Symbol</TableCell>
                                        <TableCell>Direction</TableCell>
                                        <TableCell>Result</TableCell>
                                        <TableCell>R:R</TableCell>
                                        <TableCell>Strategy</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedTrades.map((trade) => (
                                        <TableRow
                                            key={trade.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {formatDate(trade.date)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={trade.symbol}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={trade.direction === 'long' ? <TrendingUp /> : <TrendingDown />}
                                                    label={trade.direction === 'long' ? 'Long' : 'Short'}
                                                    color={trade.direction === 'long' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    color={trade.result >= 0 ? 'success.main' : 'error.main'}
                                                    fontWeight="bold"
                                                >
                                                    {trade.result >= 0 ? '+' : ''}${trade.result.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {trade.rrRatio}:1
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={trade.strategy}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="View">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewTrade(trade)}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => deleteTrade(trade.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: trades.length }]}
                            component="div"
                            count={trades.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ flexShrink: 0 }} // Prevent pagination from shrinking
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Trade Detail Modal - Full Screen on Mobile */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    Trade Details - {selectedTrade?.symbol}
                </DialogTitle>
                <DialogContent>
                    {selectedTrade && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                                    <Typography>{formatDate(selectedTrade.date)}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Direction</Typography>
                                    <Chip
                                        icon={selectedTrade.direction === 'long' ? <TrendingUp /> : <TrendingDown />}
                                        label={selectedTrade.direction === 'long' ? 'Long' : 'Short'}
                                        color={selectedTrade.direction === 'long' ? 'success' : 'error'}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Strategy</Typography>
                                    <Chip
                                        label={selectedTrade.strategy}
                                        size="small"
                                        color="primary"
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Entry Price</Typography>
                                    <Typography>{selectedTrade.entryPrice}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Exit Price</Typography>
                                    <Typography>{selectedTrade.exitPrice}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Stop Loss</Typography>
                                    <Typography>{selectedTrade.stopLoss}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Take Profit</Typography>
                                    <Typography>{selectedTrade.takeProfit}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Position Size</Typography>
                                    <Typography>{selectedTrade.positionSize}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Risk Amount</Typography>
                                    <Typography>${selectedTrade.riskAmount}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Risk/Reward</Typography>
                                    <Typography>{selectedTrade.rrRatio}:1</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Result</Typography>
                                    <Typography
                                        color={selectedTrade.result >= 0 ? 'success.main' : 'error.main'}
                                        fontWeight="bold"
                                        variant="h6"
                                    >
                                        {selectedTrade.result >= 0 ? '+' : ''}${selectedTrade.result.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Timeframe</Typography>
                                    <Typography>{selectedTrade.timeframe}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Emotion</Typography>
                                    <Chip
                                        label={
                                            selectedTrade.emotion === 'confident' ? '💪 Confident' :
                                                selectedTrade.emotion === 'nervous' ? '😰 Nervous' :
                                                    selectedTrade.emotion === 'greedy' ? '💰 Greedy' :
                                                        selectedTrade.emotion === 'fearful' ? '😨 Fearful' : '😐 Neutral'
                                        }
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                                <Typography>{selectedTrade.notes || 'No notes provided'}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TradeList;