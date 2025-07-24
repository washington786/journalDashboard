import React, { useState } from 'react'
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
  Divider
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'
import AnalyticsIcon from '@mui/icons-material/Analytics'

import Dashboard from './components/Dashboard'
import TradeForm from './components/TradeForm'
import TradeList from './components/TradeList'
import Statistics from './components/Statistics'

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
    { text: 'Trade History', icon: <ListIcon />, component: <TradeList /> },
    { text: 'Statistics', icon: <AnalyticsIcon />, component: <Statistics /> },
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              🎯 Homie's Trading Journal
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#1e1e1e',
              borderRight: '1px solid #333'
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List>
              {pages.map((page, index) => (
                <ListItem
                  button
                  key={page.text}
                  onClick={() => setActivePage(index)}
                  sx={{
                    backgroundColor: activePage === index ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    borderRadius: '0 20px 20px 0',
                    mr: 2,
                    mb: 1
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: activePage === index ? '#1976d2' : 'rgba(255, 255, 255, 0.7)',
                      minWidth: '40px'
                    }}
                  >
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={page.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: activePage === index ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                        fontWeight: activePage === index ? 600 : 400
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Quick Stats in Sidebar */}
            <List>
              <ListItem>
                <ListItemText
                  primary="Quick Stats"
                  secondary="Your trading performance"
                  sx={{
                    '& .MuiListItemText-primary': { color: '#1976d2', fontWeight: 600 },
                    '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.5)' }
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {pages[activePage].component}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App