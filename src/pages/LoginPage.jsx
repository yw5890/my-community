import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonitorIcon from '@mui/icons-material/Monitor';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { supabase } from '../supabase';

/**
 * LoginPage 컴포넌트
 * 로그인 페이지
 */
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      navigate('/');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const sxField = {
    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#050505' } },
    '& .MuiInputLabel-root.Mui-focused': { color: '#050505' },
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      {/* 뒤로가기 버튼 */}
      <Box sx={{ p: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Container maxWidth='xs' sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', pb: 6 }}>
        <Paper elevation={2} sx={{ width: '100%', p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          {/* 로고 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MonitorIcon sx={{ fontSize: 32, color: '#050505' }} />
              <Typography variant='h5' fontWeight={800} letterSpacing={1}>
                MonitorHub
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary'>Log in to your account</Typography>
          </Box>

          {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ ...sxField, mb: 2 }}
          />
          <TextField
            fullWidth
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ ...sxField, mb: 3 }}
          />

          {/* 로그인 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              onClick={handleLogin}
              disabled={loading}
              sx={{ bgcolor: '#050505', '&:hover': { bgcolor: '#333' }, px: 4 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant='caption' color='text.secondary'>or continue with</Typography>
          </Divider>

          {/* 소셜 로그인 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            {[
              { icon: <GoogleIcon />, label: 'Google' },
              { icon: <GitHubIcon />, label: 'GitHub' },
              { icon: <FacebookIcon />, label: 'Facebook' },
              { icon: <TwitterIcon />, label: 'Twitter' },
            ].map(({ icon, label }) => (
              <IconButton
                key={label}
                title={label}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 1.2,
                  '&:hover': { bgcolor: '#f5f5f5', borderColor: '#050505' },
                }}
              >
                {icon}
              </IconButton>
            ))}
          </Box>

          {/* 회원가입 */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary' component='span'>
              Don't have an account?{' '}
            </Typography>
            <Typography
              variant='body2'
              component='span'
              fontWeight={600}
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/signup')}
            >
              Sign up
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
