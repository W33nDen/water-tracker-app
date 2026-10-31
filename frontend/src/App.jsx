import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SharedLayout from './components/SharedLayout';
import PrivateRoute from './routes/PrivateRoute';
import RestrictedRoute from './routes/RestrictedRoute';
import WelcomePage from './pages/WelcomePage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import useAuthStore from './store/authStore';

function App() {
  const refreshUser = useAuthStore((s) => s.refreshUser);

  // Background profile refresh on app load (no-op without a token)
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Navigate to="/welcome" replace />} />
          <Route path="welcome" element={<WelcomePage />} />
          <Route
            path="signin"
            element={
              <RestrictedRoute>
                <SigninPage />
              </RestrictedRoute>
            }
          />
          <Route
            path="signup"
            element={
              <RestrictedRoute>
                <SignupPage />
              </RestrictedRoute>
            }
          />
          <Route
            path="home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
