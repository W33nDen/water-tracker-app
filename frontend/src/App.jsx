import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SharedLayout from './components/SharedLayout';
import WelcomePage from './pages/WelcomePage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Navigate to="/welcome" replace />} />
          <Route path="welcome" element={<WelcomePage />} />
          <Route path="signin" element={<SigninPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="home" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
