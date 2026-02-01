import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1877F2', // Facebook-like blue, looking at the image it's a vibrant blue
        },
        background: {
            default: '#f0f2f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#050505',
            secondary: '#65676B',
        },
    },
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        button: {
            textTransform: 'none', // Social apps usually don't use all-caps buttons
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

export default theme;
