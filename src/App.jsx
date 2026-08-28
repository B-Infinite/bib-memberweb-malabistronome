import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Vouchers from './pages/Vouchers';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import News from './pages/News';
import Outlets from './pages/Outlets';
import Tenants from './pages/Tenants';
import DetailPage from './pages/DetailPage';
import TenantDetailPage from './pages/TenantDetailPage';
import ListAll from './pages/ListAll';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
        <ScrollToTop />
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vouchers"
            element={
              <ProtectedRoute>
                <Vouchers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/edit-profile"     element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/news"    element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/outlets" element={<ProtectedRoute><Outlets /></ProtectedRoute>} />
          <Route path="/tenants" element={<ProtectedRoute><Tenants /></ProtectedRoute>} />
          <Route path="/news-detail"    element={<ProtectedRoute><DetailPage /></ProtectedRoute>} />
          <Route path="/tenant-detail"  element={<ProtectedRoute><TenantDetailPage /></ProtectedRoute>} />
          <Route path="/all-news"       element={<ProtectedRoute><ListAll /></ProtectedRoute>} />
          {/* Redirect root → home (ProtectedRoute will bounce to /login if not auth'd) */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
