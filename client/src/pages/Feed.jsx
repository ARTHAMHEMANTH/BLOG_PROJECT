import React, { useEffect, useState } from 'react';
import { Box, Container, Chip, Fab, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const { user } = useAuth();

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Container maxWidth="sm" sx={{ px: 0, pt: 2 }}>
            <CreatePost onPostCreated={fetchPosts} />

            <Box sx={{ px: 1, mt: 2 }}>
                {posts.length > 0 ? posts.map(post => (
                    <PostCard key={post._id} post={post} onDelete={fetchPosts} />
                )) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">Loading posts...</Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Feed;
