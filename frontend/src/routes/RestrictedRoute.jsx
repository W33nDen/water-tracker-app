import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * RestrictedRoute — only for guests (/signin, /signup).
 * A logged-in user is redirected to /home.
 */
function RestrictedRoute({ children, redirectTo = '/home' }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

export default RestrictedRoute;
