import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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

    const { data, count } = await supabase
      .from('posts')
      .select('id, title, view_count, created_at, user_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!data || data.length === 0) {
      setPosts([]);
      setTotalCount(count || 0);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', userIds);

    const profileMap = {};
    profiles?.forEach((p) => { profileMap[p.id] = p.nickname; });

    const postIds = data.map((p) => p.id);
    const { data: commentRows } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const commentCountMap = {};
    commentRows?.forEach((c) => {
      commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
    });

    setPosts(data.map((post) => ({
      ...post,
      nickname: profileMap[post.user_id] || 'Unknown',
      commentCount: commentCountMap[post.id] || 0,
    })));
    setTotalCount(count || 0);
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Navbar />
      <Container maxWidth='md' sx={{ py: { xs: 4, md: 6 } }}>

        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant='overline' sx={{ color: '#999', letterSpacing: 2, fontSize: '0.7rem' }}>
              COMMUNITY
            </Typography>
            <Typography variant='h5' fontWeight={700} sx={{ mt: 0.2, letterSpacing: -0.5 }}>
              Monitor Board
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/write')}
            sx={{
              bgcolor: '#050505',
              '&:hover': { bgcolor: '#222' },
              px: 2.5,
              py: 1,
              fontSize: '0.85rem',
              boxShadow: 'none',
            }}
          >
            Write
          </Button>
        </Box>

        {/* 컬럼 헤더 */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            px: 2,
            pb: 1,
            borderBottom: '2px solid #050505',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='caption' fontWeight={700} sx={{ color: '#050505', letterSpacing: 1, textTransform: 'uppercase' }}>
              Title
            </Typography>
          </Box>
          <Typography variant='caption' fontWeight={700} sx={{ width: 110, textAlign: 'center', color: '#050505', letterSpacing: 1, textTransform: 'uppercase' }}>
            Author
          </Typography>
          <Typography variant='caption' fontWeight={700} sx={{ width: 100, textAlign: 'center', color: '#050505', letterSpacing: 1, textTransform: 'uppercase' }}>
            Date
          </Typography>
          <Typography variant='caption' fontWeight={700} sx={{ width: 60, textAlign: 'center', color: '#050505', letterSpacing: 1, textTransform: 'uppercase' }}>
            Views
          </Typography>
          <Typography variant='caption' fontWeight={700} sx={{ width: 60, textAlign: 'center', color: '#050505', letterSpacing: 1, textTransform: 'uppercase' }}>
            Reply
          </Typography>
        </Box>

        {/* 게시물 목록 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={28} sx={{ color: '#050505' }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography color='text.secondary' variant='body2'>
              No posts yet. Be the first to share.
            </Typography>
          </Box>
        ) : (
          posts.map((post, index) => (
            <Box
              key={post.id}
              onClick={() => navigate(`/posts/${post.id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: { xs: 1.8, md: 1.5 },
                cursor: 'pointer',
                borderBottom: '1px solid #efefef',
                '&:hover': {
                  bgcolor: '#fff',
                  '& .post-title': { color: '#050505' },
                },
                transition: 'background 0.1s',
              }}
            >
              {/* 번호 (데스크톱) */}
              <Typography
                variant='caption'
                sx={{ width: 36, color: '#ccc', flexShrink: 0, display: { xs: 'none', md: 'block' } }}
              >
                {totalCount - (page - 1) * PAGE_SIZE - index}
              </Typography>

              {/* 제목 + 모바일 메타 */}
              <Box sx={{ flexGrow: 1, minWidth: 0, ml: { xs: 0, md: 0 } }}>
                <Typography
                  className='post-title'
                  variant='body2'
                  fontWeight={500}
                  noWrap
                  sx={{ color: '#333', transition: 'color 0.1s' }}
                >
                  {post.title}
                  {post.commentCount > 0 && (
                    <Typography
                      component='span'
                      variant='caption'
                      sx={{ ml: 0.8, color: '#050505', fontWeight: 700 }}
                    >
                      [{post.commentCount}]
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1.5, mt: 0.4, alignItems: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#aaa' }}>{post.nickname}</Typography>
                  <Typography variant='caption' sx={{ color: '#ccc' }}>·</Typography>
                  <Typography variant='caption' sx={{ color: '#aaa' }}>{formatDate(post.created_at)}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 'auto' }}>
                    <VisibilityOutlinedIcon sx={{ fontSize: 11, color: '#bbb' }} />
                    <Typography variant='caption' sx={{ color: '#bbb' }}>{post.view_count}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* 데스크톱 메타 */}
              <Typography variant='caption' sx={{ width: 110, textAlign: 'center', color: '#888', display: { xs: 'none', md: 'block' }, flexShrink: 0 }} noWrap>
                {post.nickname}
              </Typography>
              <Typography variant='caption' sx={{ width: 100, textAlign: 'center', color: '#aaa', display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
                {formatDate(post.created_at)}
              </Typography>
              <Box sx={{ width: 60, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 0.4, flexShrink: 0 }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 13, color: '#bbb' }} />
                <Typography variant='caption' sx={{ color: '#aaa' }}>{post.view_count}</Typography>
              </Box>
              <Box sx={{ width: 60, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 0.4, flexShrink: 0 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 13, color: '#bbb' }} />
                <Typography variant='caption' sx={{ color: '#aaa' }}>{post.commentCount}</Typography>
              </Box>
            </Box>
          ))
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size='small'
              sx={{
                '& .MuiPaginationItem-root': { color: '#555', fontSize: '0.82rem' },
                '& .MuiPaginationItem-root.Mui-selected': {
                  bgcolor: '#050505',
                  color: '#fff',
                  '&:hover': { bgcolor: '#222' },
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
