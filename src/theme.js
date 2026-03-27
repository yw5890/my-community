import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#050505',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#444444',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9f9f9',
    },
    text: {
      primary: '#050505',
      secondary: '#555555',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
