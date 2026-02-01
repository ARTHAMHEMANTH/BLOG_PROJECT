import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Badge, Button } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { logout } = useAuth();
    return (
        <Box sx={{ pb: 1, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ pt: 1 }}>
                <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Typography variant="h5" component={Link} to="/" sx={{ fontWeight: 'bold', color: '#1877F2', textDecoration: 'none' }}>
                        Social
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton color="default" sx={{ bgcolor: alpha('#000', 0.05) }}>
                            <Badge badgeContent={1} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                        <IconButton component={Link} to="/profile" sx={{ p: 0 }}>
                            <Avatar alt="User" sx={{ width: 32, height: 32, bgcolor: '#1877F2' }} />
                        </IconButton>
                        <Button
                            color="inherit"
                            onClick={logout}
                            sx={{ ml: 1, textTransform: 'none', fontWeight: 'bold', border: '1px solid #e0e0e0', borderRadius: 2 }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Header;
