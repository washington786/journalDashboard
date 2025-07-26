import { useState, useEffect } from 'react'
import localforage from 'localforage'
import type { Trade } from '../types/trade'

const TRADES_STORE = 'trading_journal_trades'

export const useTrades = () => {
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTrades()
    }, [])

    const loadTrades = async () => {
        try {
            const storedTrades = await localforage.getItem<Trade[]>(TRADES_STORE)
            if (storedTrades) {
                // Convert date strings back to Date objects
                const parsedTrades = storedTrades.map(trade => ({
                    ...trade,
                    date: new Date(trade.date)
                }))
                setTrades(parsedTrades)
            }
        } catch (error) {
            console.error('Error loading trades:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveTrades = async (newTrades: Trade[]) => {
        try {
            await localforage.setItem(TRADES_STORE, newTrades)
            setTrades(newTrades)
        } catch (error) {
            console.error('Error saving trades:', error)
            throw error
        }
    }

    const addTrade = async (trade: Trade) => {
        const newTrades = [...trades, trade]
        await saveTrades(newTrades)
    }

    const updateTrade = async (id: string, updatedTrade: Partial<Trade>) => {
        const newTrades = trades.map(trade =>
            trade.id === id ? { ...trade, ...updatedTrade } : trade
        )
        await saveTrades(newTrades)
    }

    const deleteTrade = async (id: string) => {
        const newTrades = trades.filter(trade => trade.id !== id)
        await saveTrades(newTrades)
    }

    return {
        trades,
        loading,
        addTrade,
        updateTrade,
        deleteTrade
    }
}