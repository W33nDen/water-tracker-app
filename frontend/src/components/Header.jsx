import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-4 shadow-sm">
      <Link to="/" className="text-xl font-bold text-blue-500">
        WaterTracker
      </Link>
      <nav className="flex gap-4">
        <Link
          to="/signin"
          className="text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          Sign Up
        </Link>
      </nav>
    </header>
  );
}

export default Header;
