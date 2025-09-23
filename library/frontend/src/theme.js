import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0D47A1', // Deep blue
    },
    secondary: {
      main: '#FF7043', // Coral
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white for glassmorphism
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    // Add more typography variants as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
        },
      },
    },
    // Add more component overrides for a consistent look
  },
});

export default theme;