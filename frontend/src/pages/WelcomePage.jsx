import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <section className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Water consumption tracker
      </h1>
      <p className="mb-8 max-w-md text-gray-600">
        Record daily water intake and track your progress towards your personal hydration goals.
      </p>
      <div className="flex gap-4">
        <Link
          to="/signup"
          className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 transition-colors"
        >
          Try tracker
        </Link>
        <Link
          to="/signin"
          className="rounded-lg border border-blue-500 px-6 py-3 font-medium text-blue-500 hover:bg-blue-50 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </section>
  );
}

export default WelcomePage;
