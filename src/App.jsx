import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<PostListPage />} />
        <Route path='/posts/:id' element={<PostDetailPage />} />
        <Route path='/write' element={<PostCreatePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
