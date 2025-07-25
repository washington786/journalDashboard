import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import {
  CssBaseline,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material'

import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'
import AnalyticsIcon from '@mui/icons-material/Analytics'

import Dashboard from './components/Dashboard'
import TradeForm from './components/TradeForm'
import Statistics from './components/Statistics'
import TradingInstructions from './components/TradingInstructions';
import TradeList from './components/TradeList';
import SmartAnalyzer from './components/SmartAnalyzer';
import { PolylineOutlined } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
})

const drawerWidth = 240

function App() {
  const [activePage, setActivePage] = useState(0)

  const pages = [
    { text: 'Dashboard', icon: <DashboardIcon />, component: <Dashboard /> },
    { text: 'New Trade', icon: <AddIcon />, component: <TradeForm /> },
    { text: 'Smart Analyzer', icon: <PolylineOutlined />, component: <SmartAnalyzer /> },
    { text: 'Trade History', icon: <ListIcon />, component: <TradeList /> },
    { text: 'Statistics', icon: <AnalyticsIcon />, component: <Statistics /> },
    { text: 'Guideline', icon: <MenuBookIcon />, component: <TradingInstructions /> },
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              🎯 Homie's Trading Journal
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#1e1e1e',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List>
              {pages.map((page, index) => (
                <ListItem
                  key={page.text}
                  onClick={() => setActivePage(index)}
                  sx={{
                    backgroundColor: activePage === index ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    borderRadius: '0 20px 20px 0',
                    mr: 2,
                    mb: 1,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ color: activePage === index ? '#1976d2' : 'rgba(255, 255, 255, 0.7)' }}>
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={page.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: activePage === index ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {pages[activePage].component}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App