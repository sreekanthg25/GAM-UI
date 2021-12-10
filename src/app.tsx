import React, { ReactElement } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'Recoil';
import { useMediaQuery, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Pages from './pages';

export default function App(): ReactElement {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RecoilRoot>
        <Router>
          <Pages />
        </Router>
      </RecoilRoot>
    </ThemeProvider>
  );
}
