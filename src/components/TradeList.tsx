import React, { useState } from 'react'
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material'
import {
    DataGrid,
    GridToolbar
} from '@mui/x-data-grid'
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    TrendingUp,
    TrendingDown
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useTrades } from '../hooks/useTrades'
import { Trade } from '../types/trade'

const TradeList = () => {
    const { trades, deleteTrade, loading } = useTrades()
    const [pageSize, setPageSize] = useState(10)

    const columns = [
        {
            field: 'date',
            headerName: 'Date',
            width: 120,
            valueFormatter: (params: any) => format(new Date(params.value), 'MMM dd, yyyy')
        },
        {
            field: 'symbol',
            headerName: 'Symbol',
            width: 100,
            renderCell: (params: any) => (
                <Chip
                    label={params.value}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'direction',
            headerName: 'Direction',
            width: 100,
            renderCell: (params: any) => (
                <Chip
                    icon={params.value === 'long' ? <TrendingUp /> : <TrendingDown />}
                    label={params.value === 'long' ? 'Long' : 'Short'}
                    color={params.value === 'long' ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'result',
            headerName: 'Result ($)',
            width: 120,
            renderCell: (params: any) => (
                <Typography
                    color={params.value >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                >
                    {params.value >= 0 ? '+' : ''}{params.value.toFixed(2)}
                </Typography>
            )
        },
        {
            field: 'rrRatio',
            headerName: 'R:R',
            width: 80,
            valueFormatter: (params: any) => `${params.value}:1`
        },
        {
            field: 'strategy',
            headerName: 'Strategy',
            width: 120,
            renderCell: (params: any) => (
                <Chip
                    label={params.value}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )
        },
        {
            field: 'emotion',
            headerName: 'Emotion',
            width: 100,
            renderCell: (params: any) => {
                const emotionMap: Record<string, string> = {
                    confident: '💪',
                    neutral: '😐',
                    nervous: '😰',
                    greedy: '💰',
                    fearful: '😨'
                };
                return <span>{emotionMap[params.value] || params.value}</span>;
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params: any) => (
                <Box>
                    <Tooltip title="Edit">
                        <IconButton size="small">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => deleteTrade(params.row.id)}
                            color="error"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ]

    if (loading) {
        return <Typography>Loading trades...</Typography>
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    📋 Trade History
                </Typography>

                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={trades || []}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        pagination
                        components={{
                            Toolbar: GridToolbar,
                        }}
                        componentsProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                            },
                        }}
                        disableSelectionOnClick
                        experimentalFeatures={{ newEditingApi: true }}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}

export default TradeList