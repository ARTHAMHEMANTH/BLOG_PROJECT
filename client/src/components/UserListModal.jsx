import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Typography, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../api';

const UserListModal = ({ open, onClose, title, username, type }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!open || !username || !type) return;
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/users/${username}/${type}`);
                setUsers(res.data);
            } catch (err) {
                console.error(`Failed to fetch ${type}:`, err);
                setError(`Failed to load ${type}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [open, username, type]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{title}</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : users.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">No users found.</Typography>
                    </Box>
                ) : (
                    <List sx={{ pt: 0 }}>
                        {users.map((u) => (
                            <ListItem
                                key={u._id}
                                component={Link}
                                to={`/profile/${u.username}`}
                                onClick={onClose}
                                sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { bgcolor: '#f5f5f5' } }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#1877F2' }}>
                                        {u.username[0].toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography fontWeight="bold">{u.username}</Typography>}
                                    secondary={`@${u.username}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserListModal;
