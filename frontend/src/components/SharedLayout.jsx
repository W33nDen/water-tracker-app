import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * SharedLayout — root layout wrapper.
 * Renders sticky Header on top, then the matched child route via <Outlet />.
 * All routes (welcome, signin, signup, home) live inside this layout.
 */
function SharedLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default SharedLayout;
