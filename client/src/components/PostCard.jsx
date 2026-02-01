import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, IconButton, Typography, Box, Button, TextField, Collapse, Menu, MenuItem } from '@mui/material';
import { ThumbUp, ChatBubbleOutline, Share, MoreVert } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete, onFollowToggle }) => {
    const { user, updateUser } = useAuth();
    const [likes, setLikes] = useState(post.likes);
    const [comments, setComments] = useState(post.comments);
    const [commentText, setCommentText] = useState('');
    const [expanded, setExpanded] = useState(false);
    // Check if current user follows this post's author
    const isFollowing = user?.following?.some(id => id?.toString() === post.userId?.toString());
    const [followed, setFollowed] = useState(isFollowing || false);

    useEffect(() => {
        setFollowed(user?.following?.some(id => id?.toString() === post.userId?.toString()) || false);
    }, [user?.following, post.userId]);

    const isLiked = (likes || []).some(id =>
        id?.toString() === (user?.userId || user?._id)?.toString()
    );

    const handleLike = async () => {
        if (!user) return alert("Please login to like posts");
        try {
            const res = await api.put(`/posts/${post._id}/like`, { userId: user.userId || user._id });
            setLikes(res.data);
        } catch (err) {
            console.error("Like failed", err);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await api.post(`/posts/${post._id}/comment`, {
                userId: user.userId,
                username: user.username,
                text: commentText
            });
            setComments(res.data);
            setCommentText('');
        } catch (err) {
            console.error("Comment failed", err);
        }
    };



    const handleFollow = async () => {
        if (!user) return alert("Please login to follow users");
        try {
            const res = await api.put(`/users/${post.userId}/follow`, { userId: user.userId || user._id });
            setFollowed(res.data.followed);

            // Sync with global state
            let updatedFollowing = [...(user?.following || [])];
            if (res.data.followed) {
                updatedFollowing.push(post.userId);
            } else {
                updatedFollowing = updatedFollowing.filter(id => id?.toString() !== post.userId?.toString());
            }
            updateUser({ following: updatedFollowing });
            if (onFollowToggle) onFollowToggle(res.data.followed);
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    const handleShare = () => {
        const postUrl = `${window.location.origin}/profile/${post.username}`;
        navigator.clipboard.writeText(postUrl);
        alert("Profile link copied to clipboard!");
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        handleMenuClose();
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await api.delete(`/posts/${post._id}?userId=${user.userId || user.username}`);
                if (onDelete) onDelete();
            } catch (err) {
                console.error("Failed to delete post", err);
                const errorMsg = err.response?.data?.msg || "Failed to delete post";
                alert(errorMsg);
            }
        }
    };

    const isOwner = user?.userId?.toString() === post.userId?.toString() || user?.username === post.username;

    return (
        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <CardHeader
                avatar={
                    <IconButton component={Link} to={`/profile/${post.username}`} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: '#1877F2' }} aria-label="recipe">
                            {post.username ? post.username[0].toUpperCase() : '?'}
                        </Avatar>
                    </IconButton>
                }
                action={
                    <Box>
                        {/* Replaced PushPin with MoreVert for menu if owner, else maybe nothing or report? Keeping it simple. */}
                        {isOwner && (
                            <>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVert />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleDelete}>Delete Post</MenuItem>
                                    <MenuItem onClick={handleMenuClose}>Cancel</MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                }
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography component={Link} to={`/profile/${post.username}`} variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                {post.username || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">@{post.username || 'unknown'}</Typography>
                        </Box>
                        {!isOwner && user && (
                            <Button
                                size="small"
                                variant={followed ? "outlined" : "contained"}
                                onClick={handleFollow}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 2,
                                    height: 30,
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    bgcolor: followed ? 'transparent' : '#1877F2',
                                    color: followed ? '#1877F2' : 'white',
                                    border: '1px solid #1877F2'
                                }}
                            >
                                {followed ? "Following" : "Follow"}
                            </Button>
                        )}
                    </Box>
                }
                subheader={new Date(post.createdAt).toLocaleString()}
            />
            <CardContent>
                <Typography variant="body1" color="text.primary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {post.content}
                </Typography>
                {post.image && (
                    <Box
                        component="img"
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            maxHeight: 400,
                            objectFit: 'cover'
                        }}
                        alt="Post image"
                        src={post.image}
                    />
                )}
            </CardContent>
            <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box>
                    <IconButton onClick={handleLike} color={isLiked ? 'primary' : 'default'}>
                        <ThumbUp />
                    </IconButton>
                    <Typography variant="caption">{likes.length}</Typography>

                    <IconButton onClick={() => setExpanded(!expanded)}>
                        <ChatBubbleOutline />
                    </IconButton>
                    <Typography variant="caption">{comments.length}</Typography>

                    <IconButton onClick={handleShare}>
                        <Share />
                    </IconButton>
                </Box>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <Button variant="contained" size="small" onClick={handleComment}>Post</Button>
                    </Box>
                    {comments.map((comment, index) => (
                        <Box key={index} sx={{ mb: 1, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">{comment.username}</Typography>
                            <Typography variant="body2">{comment.text}</Typography>
                        </Box>
                    ))}
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default PostCard;
