import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AdminAuthProvider } from './contexts/admin/adminauthcontext';
import AdminLayout from './pages/admin/adminlayout';
import AdminLogin from './pages/admin/login';
import Dashboard from './pages/admin/dashboard';
import AdminProfile from './pages/admin/profile';

// User Management
import UsersOverview from './pages/admin/users/index';
import Readers from './pages/admin/users/readers';
import Writers from './pages/admin/users/writers';
import ChangeUserStatus from './pages/admin/users/changestatus';
import PromoteToAdmin from './pages/admin/users/promotetoadmin';

// Novel Management
import Novels from './pages/admin/novels';
import ReviewNovels from './pages/admin/novels/review';
import ModerateNovels from './pages/admin/novels/moderate';

// Yuan Management
import Yuan from './pages/admin/yuan';
import YuanStatistics from './pages/admin/yuan/yuanstatistics';

// Other pages
import Categories from './pages/admin/categories';
import Chapters from './pages/admin/chapters';
import Comments from './pages/admin/comments';
import Reviews from './pages/admin/reviews';
import Rankings from './pages/admin/rankings';
import Reports from './pages/admin/reports';
import Library from './pages/admin/library';
import Settings from './pages/admin/settings';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  // Use basename only when deploying to GitHub Pages or PUBLIC_URL is set
  const basename = process.env.PUBLIC_URL ? '/yushan-platform-admin' : '';

  return (
    <AdminAuthProvider>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<AdminProfile />} />

            {/* User Management */}
            <Route path="users" element={<UsersOverview />} />
            <Route path="users/readers" element={<Readers />} />
            <Route path="users/writers" element={<Writers />} />
            <Route path="users/change-status" element={<ChangeUserStatus />} />
            <Route path="users/promote-admin" element={<PromoteToAdmin />} />

            {/* Content Management */}
            <Route path="novels" element={<Novels />} />
            <Route path="novels/review" element={<ReviewNovels />} />
            <Route path="novels/moderate" element={<ModerateNovels />} />
            <Route path="categories" element={<Categories />} />
            <Route path="chapters" element={<Chapters />} />

            {/* Community Management */}
            <Route path="comments" element={<Comments />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="rankings" element={<Rankings />} />
            <Route path="reports" element={<Reports />} />

            {/* Platform Management */}
            <Route path="yuan" element={<Yuan />} />
            <Route path="yuan/statistics" element={<YuanStatistics />} />
            <Route path="library" element={<Library />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
