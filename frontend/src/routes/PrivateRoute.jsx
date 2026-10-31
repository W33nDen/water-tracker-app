import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * PrivateRoute — only for logged-in users.
 * Without a token, redirects to /signin (remembering where the user was going).
 */
function PrivateRoute({ children, redirectTo = '/signin' }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return children;
}

export default PrivateRoute;
