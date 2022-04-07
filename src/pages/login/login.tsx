import React, { FC, ReactElement, useState } from 'react';
import { Redirect } from 'react-router';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRecoilState } from 'Recoil';

// Material UI Components
import {
  Avatar,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  Snackbar,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// local imports
import { Copyright } from '@/components';
import api from '@/utils/api';
import { userSelector } from '@/recoil/selectors/user';

const PaperStyled = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

interface IFormInputs {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().required(),
  password: yup.string().required(),
});

const SignIn: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });
  const [isLoading, setLoadingState] = useState(false);
  const initErrorState = { open: false, message: '' };
  const [err, setErrors] = useState(initErrorState);
  const [isAuthenticated, setUserState] = useRecoilState(userSelector);

  const handleLogin: SubmitHandler<IFormInputs> = async (data) => {
    setLoadingState(true);
    try {
      const resp = await api.post('//api.gamplus.in/v1/login', { ...data });
      setUserState(resp);
    } catch (err) {
      const { error } = err as { error: string };
      setLoadingState(false);
      setErrors({ open: true, message: error || 'Something went wrong, try after sometime' });
    }
  };

  const renderSnackBar = (): ReactElement => {
    return (
      <Snackbar open={true} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
        <Alert severity="error" variant="filled" onClose={() => setErrors(initErrorState)}>
          <AlertTitle>Error</AlertTitle>
          {err.message}
        </Alert>
      </Snackbar>
    );
  };

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Grid
      container
      sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', minHeight: '100vh' }}
    >
      <Grid item xs={11} md={3}>
        <PaperStyled elevation={10}>
          {err.open && renderSnackBar()}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit(handleLogin)} noValidate sx={{ mt: 1 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.email}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.password}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  type="password"
                  label="Password"
                  autoComplete="current-password"
                />
              )}
            />
            <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 3, mb: 2 }}>
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </PaperStyled>
      </Grid>
      <Grid item xs={6} md={4}>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Grid>
    </Grid>
  );
};

export default SignIn;
