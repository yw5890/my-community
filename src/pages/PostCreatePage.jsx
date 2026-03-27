import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Navbar from '../components/common/Navbar';
import { supabase } from '../supabase';

/**
 * PostCreatePage 컴포넌트
 * 게시물 작성 페이지
 */
function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) navigate('/login');
      else setUser(session.user);
    });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);

    const { data, error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
    }).select().single();

    setSubmitting(false);
    if (!error && data) navigate(`/posts/${data.id}`);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant='outlined'
            sx={{ borderColor: '#050505', color: '#050505' }}
          >
            Back
          </Button>
          <Typography variant='h5' fontWeight={700}>
            Write Post
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid #eee' }}>
          <TextField
            fullWidth
            label='Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#050505' } },
              '& .MuiInputLabel-root.Mui-focused': { color: '#050505' },
            }}
          />
          <TextField
            fullWidth
            label='Content'
            multiline
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#050505' } },
              '& .MuiInputLabel-root.Mui-focused': { color: '#050505' },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !content.trim()}
              sx={{
                bgcolor: '#050505',
                '&:hover': { bgcolor: '#333' },
                px: 4,
                py: 1.2,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PostCreatePage;
