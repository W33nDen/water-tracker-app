import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import AuthForm from '../components/AuthForm';
import { signupRequest, getErrorMessage } from '../services/authApi';

function SignupPage() {
  const navigate = useNavigate();

  async function handleSignup({ email, password }) {
    try {
      await signupRequest({ email, password });
      // Per issue #6: successful sign-up redirects to /signin (no auto-login).
      toast.success('Account created! Please sign in.');
      navigate('/signin', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AuthLayout>
      <AuthForm mode="signup" onSubmit={handleSignup} />
    </AuthLayout>
  );
}

export default SignupPage;
