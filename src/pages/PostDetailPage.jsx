import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
  const [nickname, setNickname] = useState('');
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) {
      setPost(data);
      await supabase.from('posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);

      const { data: profile } = await supabase
        .from('profiles').select('nickname').eq('id', data.user_id).single();
      setNickname(profile?.nickname || 'Unknown');
    }
    const { count } = await supabase
      .from('likes').select('*', { count: 'exact', head: true }).eq('post_id', id);
    setLikesCount(count || 0);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data: commentData } = await supabase
      .from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
    if (!commentData || commentData.length === 0) { setComments([]); return; }

    const userIds = [...new Set(commentData.map((c) => c.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, nickname').in('id', userIds);
    const profileMap = {};
    profiles?.forEach((p) => { profileMap[p.id] = p.nickname; });

    setComments(commentData.map((c) => ({ ...c, nickname: profileMap[c.user_id] || 'Unknown' })));
  };

  const fetchLikeStatus = async () => {
    if (!user) return;
    const { data } = await supabase.from('likes').select('id')
      .eq('post_id', id).eq('user_id', user.id).single();
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
    await supabase.from('comments').insert({ post_id: id, user_id: user.id, content: commentText.trim() });
    setCommentText('');
    await fetchComments();
    setSubmitting(false);
  };

  const handleCommentDelete = async (commentId) => {
    await supabase.from('comments').delete().eq('id', commentId);
    await fetchComments();
  };

  const handlePostDelete = async () => {
    await supabase.from('posts').delete().eq('id', id);
    navigate('/');
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}>
          <CircularProgress size={28} sx={{ color: '#050505' }} />
        </Box>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa' }}>
        <Navbar />
        <Container maxWidth='md' sx={{ pt: 6, textAlign: 'center' }}>
          <Typography color='text.secondary'>Post not found.</Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2, color: '#050505' }}>← Back to List</Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Navbar />
      <Container maxWidth='md' sx={{ py: { xs: 4, md: 6 } }}>

        {/* 상단 네비 */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/')}
            sx={{ color: '#999', fontSize: '0.82rem', p: 0, minWidth: 0, '&:hover': { color: '#050505', bgcolor: 'transparent' } }}
          >
            Back to List
          </Button>
        </Box>

        {/* 제목 영역 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h5' fontWeight={700} sx={{ letterSpacing: -0.5, lineHeight: 1.4, mb: 2 }}>
            {post.title}
          </Typography>

          {/* 메타 + 삭제 버튼 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant='body2' fontWeight={600} sx={{ color: '#333' }}>
                {nickname}
              </Typography>
              <Typography variant='caption' sx={{ color: '#aaa' }}>
                {formatDate(post.created_at)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Typography variant='caption' sx={{ color: '#bbb' }}>
                  Views {post.view_count}
                </Typography>
                <Typography variant='caption' sx={{ color: '#bbb' }}>
                  Comments {comments.length}
                </Typography>
                <Typography variant='caption' sx={{ color: '#bbb' }}>
                  Likes {likesCount}
                </Typography>
              </Box>
            </Box>

            {/* 삭제 버튼 - 본인 글만 */}
            {user && user.id === post.user_id && (
              <Button
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={() => setDeleteDialogOpen(true)}
                size='small'
                sx={{
                  color: '#bbb',
                  fontSize: '0.78rem',
                  border: '1px solid #e5e5e5',
                  px: 1.5,
                  '&:hover': { color: '#d32f2f', borderColor: '#d32f2f', bgcolor: 'transparent' },
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#050505', borderBottomWidth: 2, mb: 4 }} />

        {/* 본문 */}
        <Box sx={{ minHeight: 200, mb: 5 }}>
          {post.thumbnail_url && (
            <Box
              component='img'
              src={post.thumbnail_url}
              alt='thumbnail'
              sx={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 1, mb: 3 }}
            />
          )}
          <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, color: '#222' }}>
            {post.content}
          </Typography>
        </Box>

        {/* 좋아요 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
          <Box
            onClick={handleLike}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.2,
              border: '1px solid',
              borderColor: liked ? '#050505' : '#ddd',
              borderRadius: 20,
              cursor: 'pointer',
              bgcolor: liked ? '#050505' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#050505', bgcolor: liked ? '#222' : '#f5f5f5' },
            }}
          >
            {liked
              ? <FavoriteIcon sx={{ fontSize: 18, color: '#fff' }} />
              : <FavoriteBorderIcon sx={{ fontSize: 18, color: '#555' }} />
            }
            <Typography variant='body2' fontWeight={600} sx={{ color: liked ? '#fff' : '#555' }}>
              {likesCount}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* 댓글 */}
        <Typography variant='body1' fontWeight={700} sx={{ mb: 3 }}>
          Comments <Typography component='span' sx={{ color: '#aaa', fontWeight: 400, fontSize: '0.9rem' }}>({comments.length})</Typography>
        </Typography>

        {/* 댓글 입력 */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
          <TextField
            fullWidth
            placeholder={user ? 'Leave a comment...' : 'Login to comment'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!user}
            size='small'
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(); } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '& fieldset': { borderColor: '#e5e5e5' },
                '&:hover fieldset': { borderColor: '#aaa' },
                '&.Mui-focused fieldset': { borderColor: '#050505', borderWidth: 1 },
              },
            }}
          />
          <Button
            variant='contained'
            onClick={handleCommentSubmit}
            disabled={!user || submitting}
            sx={{
              bgcolor: '#050505',
              '&:hover': { bgcolor: '#222' },
              boxShadow: 'none',
              flexShrink: 0,
              px: 2.5,
              fontSize: '0.82rem',
            }}
          >
            Post
          </Button>
        </Box>

        {/* 댓글 목록 */}
        {comments.length === 0 ? (
          <Typography variant='body2' sx={{ color: '#bbb', textAlign: 'center', py: 3 }}>
            No comments yet.
          </Typography>
        ) : (
          comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{
                py: 2,
                borderBottom: '1px solid #f0f0f0',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 0.8 }}>
                    <Typography variant='body2' fontWeight={600} sx={{ color: '#333' }}>
                      {comment.nickname}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#bbb' }}>
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant='body2' sx={{ color: '#444', lineHeight: 1.7 }}>
                    {comment.content}
                  </Typography>
                </Box>
                {user && user.id === comment.user_id && (
                  <IconButton
                    size='small'
                    onClick={() => handleCommentDelete(comment.id)}
                    sx={{ ml: 1, color: '#ddd', '&:hover': { color: '#d32f2f' } }}
                  >
                    <DeleteOutlineIcon fontSize='small' />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))
        )}
      </Container>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, px: 1, minWidth: 300 } }}
      >
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700, pb: 1 }}>
          Delete Post
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: '#888', fontSize: '0.82rem', border: '1px solid #e5e5e5', px: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePostDelete}
            variant='contained'
            sx={{ bgcolor: '#050505', '&:hover': { bgcolor: '#d32f2f' }, boxShadow: 'none', fontSize: '0.82rem', px: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PostDetailPage;
