import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Map paths to navigation indexes
    const getTabValue = (path) => {
        if (path === '/') return 0; // Home
        if (path.startsWith('/profile')) return 1; // Profile
        return 0;
    };

    const value = getTabValue(location.pathname);

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    if (newValue === 0) navigate('/');
                    if (newValue === 1) navigate('/profile');
                }}
                sx={{
                    height: 65,
                    '& .Mui-selected': {
                        color: '#1877F2',
                        fontWeight: 'bold'
                    }
                }}
            >
                <BottomNavigationAction label="Home" icon={<Home />} />
                <BottomNavigationAction label="Profile" icon={<Person />} />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;
