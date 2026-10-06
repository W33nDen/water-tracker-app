import { Link } from 'react-router-dom';

function SignupPage() {
  return (
    <section className="flex flex-col items-center justify-center px-5 py-20">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Sign Up</h1>
      <form className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
            Repeat password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repeat password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 transition-colors"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/signin" className="text-blue-500 hover:underline">
          Sign In
        </Link>
      </p>
    </section>
  );
}

export default SignupPage;
