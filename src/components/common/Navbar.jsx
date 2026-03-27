import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import TranslateIcon from '@mui/icons-material/Translate';
import MonitorIcon from '@mui/icons-material/Monitor';
import { supabase } from '../../supabase';

/**
 * Navbar 컴포넌트
 * Props: 없음 (supabase auth 상태 내부 관리)
 */
function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchNickname(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchNickname(session.user.id);
      else setNickname('');
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNickname = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single();
    if (data) setNickname(data.nickname);
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position='sticky' sx={{ bgcolor: '#050505' }}>
      <Toolbar>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 1 }}
          onClick={() => navigate('/')}
        >
          <MonitorIcon sx={{ color: '#fff' }} />
          <Typography variant='h6' sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
            MonitorHub
          </Typography>
        </Box>

        <Tooltip title='Change Language'>
          <IconButton sx={{ color: '#fff', mr: 1 }}>
            <TranslateIcon />
          </IconButton>
        </Tooltip>

        {user ? (
          <>
            <Tooltip title={`${nickname}님 환영합니다`}>
              <IconButton onClick={handleMenuOpen} sx={{ color: '#fff' }}>
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {nickname}님 환영합니다
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Tooltip title='Login'>
            <IconButton onClick={() => navigate('/login')} sx={{ color: '#fff' }}>
              <LoginIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
