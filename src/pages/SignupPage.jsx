import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonitorIcon from '@mui/icons-material/Monitor';
import { supabase } from '../supabase';

/**
 * SignupPage 컴포넌트
 * 회원가입 페이지 (이메일 인증 없이 즉시 가입)
 */
function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      setError('Email, password, and nickname are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          nickname: nickname.trim(),
          phone: phone.trim(),
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // 이메일 확인 없이 즉시 로그인된 경우
    if (data.session) {
      navigate('/');
    } else {
      // 이메일 확인이 필요한 경우 (Supabase 설정에 따라)
      setError('');
      navigate('/login');
    }
  };

  const sxField = {
    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#050505' } },
    '& .MuiInputLabel-root.Mui-focused': { color: '#050505' },
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      {/* 뒤로가기 */}
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
            <Typography variant='body2' color='text.secondary'>Create your account</Typography>
          </Box>

          {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ ...sxField, mb: 2 }}
          />
          <TextField
            fullWidth
            label='Password (min 6 characters)'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ ...sxField, mb: 2 }}
          />
          <TextField
            fullWidth
            label='Nickname'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            sx={{ ...sxField, mb: 2 }}
          />
          <TextField
            fullWidth
            label='Phone (optional)'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ ...sxField, mb: 3 }}
          />

          <Button
            fullWidth
            variant='contained'
            onClick={handleSignup}
            disabled={loading}
            sx={{ bgcolor: '#050505', '&:hover': { bgcolor: '#333' }, py: 1.3 }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant='body2' color='text.secondary' component='span'>
              Already have an account?{' '}
            </Typography>
            <Typography
              variant='body2'
              component='span'
              fontWeight={600}
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/login')}
            >
              Login
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default SignupPage;
