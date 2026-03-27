import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../components/common/Navbar';
import { supabase } from '../supabase';

/**
 * PostDetailPage 컴포넌트
 * 게시물 상세 페이지
 */
function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchPost();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (user) fetchLikeStatus();
  }, [user, id]);

  const fetchPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(nickname)')
      .eq('id', id)
      .single();
    if (data) {
      setPost(data);
      // 조회수 증가
      await supabase.from('posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
    }

    // 좋아요 수
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);
    setLikesCount(count || 0);

    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(nickname)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const fetchLikeStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();
    setLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', id).eq('user_id', user.id);
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      await supabase.from('likes').insert({ post_id: id, user_id: user.id });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    await supabase.from('comments').insert({
      post_id: id,
      user_id: user.id,
      content: commentText.trim(),
    });
    setCommentText('');
    await fetchComments();
    setSubmitting(false);
  };

  const handleCommentDelete = async (commentId) => {
    await supabase.from('comments').delete().eq('id', commentId);
    await fetchComments();
  };

  const handlePostDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
          <CircularProgress sx={{ color: '#050505' }} />
        </Box>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth='md' sx={{ pt: 5, textAlign: 'center' }}>
          <Typography>Post not found.</Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to List</Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
        {/* 제목 + 목록으로 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, gap: 2 }}>
          <Typography variant='h5' fontWeight={700} sx={{ flexGrow: 1 }}>
            {post.title}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant='outlined'
            size='small'
            sx={{ flexShrink: 0, borderColor: '#050505', color: '#050505' }}
          >
            Back to List
          </Button>
        </Box>

        {/* 메타데이터 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Author: <strong>{post.profiles?.nickname || 'Unknown'}</strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {formatDate(post.created_at)}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Views: {post.view_count}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Comments: {comments.length}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Likes: {likesCount}
          </Typography>
          {user && user.id === post.user_id && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={handlePostDelete}
              size='small'
              color='error'
              sx={{ ml: 'auto' }}
            >
              Delete
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 본문 */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid #eee', mb: 3, minHeight: 200 }}>
          {post.thumbnail_url && (
            <Box
              component='img'
              src={post.thumbnail_url}
              alt='thumbnail'
              sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 1, mb: 2 }}
            />
          )}
          <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {post.content}
          </Typography>
        </Paper>

        {/* 좋아요 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <IconButton
              onClick={handleLike}
              sx={{
                border: '2px solid',
                borderColor: liked ? '#e53935' : '#bbb',
                color: liked ? '#e53935' : '#bbb',
                width: 56,
                height: 56,
                '&:hover': { borderColor: '#e53935', color: '#e53935' },
              }}
            >
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant='body2' fontWeight={600}>{likesCount}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 댓글 영역 */}
        <Typography variant='h6' fontWeight={600} mb={2}>
          Comments ({comments.length})
        </Typography>

        {/* 댓글 작성란 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            placeholder={user ? 'Write a comment...' : 'Login to write a comment'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!user}
            size='small'
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(); } }}
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#050505' } } }}
          />
          <Button
            variant='contained'
            onClick={handleCommentSubmit}
            disabled={!user || submitting}
            sx={{ bgcolor: '#050505', '&:hover': { bgcolor: '#333' }, flexShrink: 0 }}
          >
            Submit
          </Button>
        </Box>

        {/* 댓글 목록 */}
        {comments.length === 0 ? (
          <Typography color='text.secondary' variant='body2'>No comments yet.</Typography>
        ) : (
          comments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              sx={{ p: 2, mb: 1, border: '1px solid #eee', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant='body1' sx={{ mb: 0.5 }}>{comment.content}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      {comment.profiles?.nickname || 'Unknown'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                </Box>
                {user && user.id === comment.user_id && (
                  <IconButton size='small' onClick={() => handleCommentDelete(comment.id)}>
                    <DeleteIcon fontSize='small' sx={{ color: '#aaa' }} />
                  </IconButton>
                )}
              </Box>
            </Paper>
          ))
        )}
      </Container>
    </Box>
  );
}

export default PostDetailPage;
