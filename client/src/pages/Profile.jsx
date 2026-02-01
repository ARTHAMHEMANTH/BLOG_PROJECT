import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Paper, Avatar, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { Person } from '@mui/icons-material';
import UserListModal from '../components/UserListModal';

const Profile = () => {
    const { user: currentUser, updateUser } = useAuth();
    const { username: urlUsername } = useParams();

    // Determine which user we are looking at
    const targetUsername = urlUsername || currentUser?.username;
    console.log("Profile check:", { urlUsername, currentUsername: currentUser?.username, targetUsername });

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followed, setFollowed] = useState(false);
    const [modalConfig, setModalConfig] = useState({ open: false, title: '', type: '' });

    const fetchProfileData = async () => {
        if (!targetUsername) {
            console.log("No targetUsername found, skipping fetch");
            setLoading(false);
            return;
        }
        console.log("Fetching profile for:", targetUsername);
        setLoading(true);
        setError(null);
        try {
            const endpoint = `/users/${targetUsername}`;
            console.log(`GET ${endpoint}`);
            const userRes = await api.get(endpoint);
            console.log("User data fetched:", userRes.data);
            const userData = userRes.data;
            setUser(userData);

            if (currentUser) {
                const myId = (currentUser.userId || currentUser._id)?.toString();
                const isFollowed = userData.followers?.some(id =>
                    id?.toString() === myId
                );
                setFollowed(isFollowed || false);
            }

            const postsEndpoint = `/posts/user/${targetUsername}`;
            console.log(`GET ${postsEndpoint}`);
            const postsRes = await api.get(postsEndpoint);
            console.log("User posts fetched:", postsRes.data.length);
            setPosts(postsRes.data);
        } catch (err) {
            console.error("Profile fetch error detail:", {
                message: err.message,
                code: err.code,
                config: err.config,
                response: err.response
            });
            const msg = err.response?.data?.msg || `Failed to load profile. (${err.message})`;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [targetUsername, currentUser]);

    const handleFollow = async () => {
        if (!currentUser || !user) return;
        try {
            const res = await api.put(`/users/${user._id}/follow`, { userId: currentUser.userId || currentUser._id });
            setFollowed(res.data.followed);

            // Sync global state
            let updatedFollowing = [...(currentUser.following || [])];
            if (res.data.followed) {
                updatedFollowing.push(user._id);
            } else {
                updatedFollowing = updatedFollowing.filter(id => id?.toString() !== user._id?.toString());
            }
            updateUser({ following: updatedFollowing });

            // Update local user followers count
            let updatedFollowers = [...(user.followers || [])];
            if (res.data.followed) {
                updatedFollowers.push(currentUser.userId || currentUser._id);
            } else {
                updatedFollowers = updatedFollowers.filter(id => id?.toString() !== (currentUser.userId || currentUser._id)?.toString());
            }
            setUser({ ...user, followers: updatedFollowers });
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !user) {
        const { logout } = useAuth();
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6" sx={{ mb: 2 }}>{error || "User not found"}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button variant="contained" onClick={fetchProfileData}>Retry</Button>
                    <Button variant="outlined" color="error" onClick={logout}>Logout & Reset</Button>
                </Box>
            </Container>
        );
    }

    const isOwnProfile = currentUser?.username === user.username;

    return (
        <Container maxWidth="md" sx={{ py: 2 }}>
            {/* User Info Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 100, height: 100, bgcolor: '#1877F2', fontSize: 40 }}>
                        {user.username ? user.username[0].toUpperCase() : <Person />}
                    </Avatar>

                    <Typography variant="h5" fontWeight="bold">
                        {user.username}
                    </Typography>

                    {!isOwnProfile && (
                        <Button
                            variant={followed ? "outlined" : "contained"}
                            onClick={handleFollow}
                            sx={{ borderRadius: 20, textTransform: 'none', px: 4, fontWeight: 'bold' }}
                        >
                            {followed ? "Unfollow" : "Follow"}
                        </Button>
                    )}

                    <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold">{posts.length}</Typography>
                            <Typography variant="caption" color="text.secondary">Posts</Typography>
                        </Box>
                        <Box
                            sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                            onClick={() => setModalConfig({ open: true, title: 'Followers', type: 'followers' })}
                        >
                            <Typography variant="h6" fontWeight="bold">{user.followers?.length || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Followers</Typography>
                        </Box>
                        <Box
                            sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                            onClick={() => setModalConfig({ open: true, title: 'Following', type: 'following' })}
                        >
                            <Typography variant="h6" fontWeight="bold">{user.following?.length || 0}</Typography>
                            <Typography variant="caption" color="text.secondary">Following</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <UserListModal
                open={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                username={user.username}
                type={modalConfig.type}
            />

            {/* User Posts List */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, px: 1 }}>
                {isOwnProfile ? "My Posts" : `${user.username}'s Posts`}
            </Typography>

            <Grid container spacing={2}>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <Grid item xs={12} key={post._id}>
                            <PostCard
                                post={post}
                                onDelete={fetchProfileData}
                                onFollowToggle={() => {
                                    fetchProfileData();
                                }}
                            />
                        </Grid>
                    ))
                ) : (
                    <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">No posts to show.</Typography>
                    </Box>
                )}
            </Grid>
        </Container>
    );
};

export default Profile;
