import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, pb: 10 }}>
                <Outlet />
            </Box>
            <BottomNav />
        </Box>
    );
};

export default Layout;
