import React, { useState, useRef } from 'react';
import { Box, Typography, Button, TextField, IconButton, Snackbar, Alert, Popover, CardMedia } from '@mui/material';
import { CameraAlt, SentimentSatisfiedAlt, FormatListBulleted, Send, Close } from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();

    const handleEmojiClick = (emojiData) => {
        setContent(prev => prev + emojiData.emoji);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setImage(reader.result); // In a real app, you might upload to Cloudinary/S3
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = async () => {
        if (!content.trim() && !image) return;
        try {
            await api.post('/posts', {
                userId: user.userId,
                username: user.username,
                content: content,
                image: image
            });
            setContent('');
            setImage(null);
            setPreview(null);
            setOpenSuccess(true);
            if (onPostCreated) onPostCreated();
        } catch (err) {
            console.error("Failed to post", err);
        }
    };

    return (
        <Box sx={{ bgcolor: 'white', p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Create Post</Typography>
            </Box>

            <TextField
                fullWidth
                placeholder="What's on your mind?"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                multiline
                minRows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 2 }}
            />

            {preview && (
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <CardMedia
                        component="img"
                        image={preview}
                        sx={{ borderRadius: 2, maxHeight: 300, width: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                        onClick={() => { setImage(null); setPreview(null); }}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            )}

            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, color: '#1877F2' }}>
                    <IconButton size="small" color="primary" onClick={() => fileInputRef.current.click()}>
                        <CameraAlt />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <SentimentSatisfiedAlt />
                    </IconButton>
                    <IconButton size="small" color="primary">
                        <FormatListBulleted />
                    </IconButton>
                </Box>

                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Popover>

                <Button
                    variant="contained"
                    endIcon={<Send />}
                    onClick={handlePost}
                    disabled={!content.trim() && !image}
                    sx={{ borderRadius: 4, textTransform: 'none', bgcolor: '#1877F2' }}
                >
                    Post
                </Button>
            </Box>
            <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}>
                <Alert onClose={() => setOpenSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Post created successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreatePost;
