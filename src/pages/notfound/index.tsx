import React, { ReactElement } from 'react';
import { Button, Paper, Typography, Box } from '@mui/material';
import { Home } from '@mui/icons-material';

const PageNotFound = (): ReactElement => {
  return (
    <Paper sx={{ bgcolor: 'background.default', margin: 0, height: `100vh` }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="h4">404 Not Found</Typography>
        <Typography variant="subtitle2">{`Oops! we haven't built this page.`}</Typography>
        <Button color="secondary" aria-label="home" href="/" sx={{ mt: 20 }}>
          <Home fontSize="large" />
        </Button>
      </Box>
    </Paper>
  );
};

export default PageNotFound;
