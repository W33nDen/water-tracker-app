import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import AuthForm from '../components/AuthForm';
import useAuthStore from '../store/authStore';
import { signinRequest, getErrorMessage } from '../services/authApi';

function SigninPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSignin(values) {
    try {
      const { token, user } = await signinRequest(values);
      setAuth(user, token);
      navigate('/home', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AuthLayout>
      <AuthForm mode="signin" onSubmit={handleSignin} />
    </AuthLayout>
  );
}

export default SigninPage;
