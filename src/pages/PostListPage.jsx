import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import ImageIcon from '@mui/icons-material/Image';
import Navbar from '../components/common/Navbar';
import { supabase } from '../supabase';

const PAGE_SIZE = 20;

/**
 * PostListPage 컴포넌트
 * 게시물 목록 페이지 (20개씩 페이지네이션)
 */
function PostListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (currentPage) => {
    setLoading(true);
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 게시물 목록
    const { data, count } = await supabase
      .from('posts')
      .select('id, title, thumbnail_url, view_count, created_at, user_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!data || data.length === 0) {
      setPosts([]);
      setTotalCount(count || 0);
      setLoading(false);
      return;
    }

    // 닉네임 조회
    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', userIds);

    const profileMap = {};
    profiles?.forEach((p) => { profileMap[p.id] = p.nickname; });

    // 댓글 수 조회
    const postIds = data.map((p) => p.id);
    const { data: commentRows } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const commentCountMap = {};
    commentRows?.forEach((c) => {
      commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
    });

    const enriched = data.map((post) => ({
      ...post,
      nickname: profileMap[post.user_id] || 'Unknown',
      commentCount: commentCountMap[post.id] || 0,
    }));

    setPosts(enriched);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 5 } }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant='h5' fontWeight={700}>
            Monitor Board
          </Typography>
          <Button
            variant='contained'
            startIcon={<EditIcon />}
            onClick={() => navigate('/write')}
            sx={{ bgcolor: '#050505', '&:hover': { bgcolor: '#333' } }}
          >
            Write Post
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* 목록 헤더 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, px: 2, py: 1, bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
          <Box sx={{ width: 60, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='body2' fontWeight={600} color='text.secondary'>Title</Typography>
          </Box>
          <Box sx={{ width: 120, textAlign: 'center' }}>
            <Typography variant='body2' fontWeight={600} color='text.secondary'>Author</Typography>
          </Box>
          <Box sx={{ width: 100, textAlign: 'center' }}>
            <Typography variant='body2' fontWeight={600} color='text.secondary'>Date</Typography>
          </Box>
          <Box sx={{ width: 70, textAlign: 'center' }}>
            <Typography variant='body2' fontWeight={600} color='text.secondary'>Views</Typography>
          </Box>
          <Box sx={{ width: 70, textAlign: 'center' }}>
            <Typography variant='body2' fontWeight={600} color='text.secondary'>Comments</Typography>
          </Box>
        </Box>

        {/* 게시물 목록 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#050505' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color='text.secondary'>No posts yet. Be the first to write!</Typography>
          </Box>
        ) : (
          posts.map((post) => (
            <Paper
              key={post.id}
              elevation={0}
              onClick={() => navigate(`/posts/${post.id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                mb: 0.5,
                cursor: 'pointer',
                border: '1px solid #eeeeee',
                '&:hover': { bgcolor: '#fafafa', borderColor: '#050505' },
                transition: 'all 0.15s',
              }}
            >
              {/* 썸네일 */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  flexShrink: 0,
                  mr: 2,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {post.thumbnail_url ? (
                  <Box
                    component='img'
                    src={post.thumbnail_url}
                    alt='thumbnail'
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageIcon sx={{ color: '#ccc' }} />
                )}
              </Box>

              {/* 제목 */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant='body1'
                  fontWeight={500}
                  noWrap
                  sx={{ color: 'text.primary' }}
                >
                  {post.title}
                </Typography>
                {/* 모바일 메타데이터 */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1.5, mt: 0.5 }}>
                  <Typography variant='caption' color='text.secondary'>
                    {post.nickname}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {formatDate(post.created_at)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <VisibilityIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant='caption' color='text.secondary'>{post.view_count}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <CommentIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant='caption' color='text.secondary'>
                      {post.commentCount}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 데스크톱 메타데이터 */}
              <Box sx={{ width: 120, textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                <Typography variant='body2' color='text.secondary' noWrap>
                  {post.nickname}
                </Typography>
              </Box>
              <Box sx={{ width: 100, textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                <Typography variant='body2' color='text.secondary'>
                  {formatDate(post.created_at)}
                </Typography>
              </Box>
              <Box sx={{ width: 70, textAlign: 'center', display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <VisibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>{post.view_count}</Typography>
              </Box>
              <Box sx={{ width: 70, textAlign: 'center', display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <CommentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  {post.commentCount}
                </Typography>
              </Box>
            </Paper>
          ))
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              sx={{
                '& .MuiPaginationItem-root.Mui-selected': {
                  bgcolor: '#050505',
                  color: '#fff',
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default PostListPage;
