import { useState } from 'react';
import { Link } from 'react-router-dom';
import bottleSignin from '../assets/bottle-signin.svg';
import bgSignin from '../assets/bg-signin.svg';
import eyeIcon from '../assets/eye.svg';
import eyeSlashIcon from '../assets/eye-slash.svg';

/**
 * SignupPage — matches Figma «Tracker of water Sign Up» (node 1059:26273)
 */
function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] w-full overflow-hidden bg-white">
      {/* Background bubble/splash illustration */}
      <img
        src={bgSignin}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 w-full max-w-[1404px] select-none object-cover opacity-60 desktop:opacity-100"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1440px] flex-col items-center justify-center px-5 py-10 tablet:px-8 desktop:flex-row desktop:justify-between desktop:px-28 desktop:py-12">
        {/* Left column: Bottle illustration */}
        <div className="relative z-10 hidden flex-1 items-center justify-center desktop:flex">
          <img
            src={bottleSignin}
            alt="Bottle of water"
            className="w-full max-w-[738px] select-none object-contain"
          />
        </div>

        {/* Right column: Sign Up Form */}
        <div className="relative z-20 w-full max-w-[384px] desktop:ml-auto">
          <h1
            className="mb-4 text-[#2F2F2F]"
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              fontSize: '26px',
              lineHeight: '32px',
            }}
          >
            Sign Up
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-email"
                className="text-base text-[#2F2F2F]"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '24px',
                }}
              >
                Enter your email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full rounded-md border border-[#D7E3FF] bg-white px-2.5 py-3 text-base text-[#407BFF] placeholder:text-[#9EBBFF] focus:border-[#407BFF] focus:outline-none"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '16px',
                  lineHeight: '20px',
                }}
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-password"
                className="text-base text-[#2F2F2F]"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '24px',
                }}
              >
                Enter your password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-md border border-[#D7E3FF] bg-white px-2.5 py-3 pr-10 text-base text-[#407BFF] placeholder:text-[#9EBBFF] focus:border-[#407BFF] focus:outline-none"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '16px',
                    lineHeight: '20px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#407BFF] transition-opacity hover:opacity-80"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <img
                    src={showPassword ? eyeSlashIcon : eyeIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            {/* Repeat Password field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-repeat-password"
                className="text-base text-[#2F2F2F]"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '24px',
                }}
              >
                Repeat password
              </label>
              <div className="relative">
                <input
                  id="signup-repeat-password"
                  type={showRepeatPassword ? 'text' : 'password'}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-md border border-[#D7E3FF] bg-white px-2.5 py-3 pr-10 text-base text-[#407BFF] placeholder:text-[#9EBBFF] focus:border-[#407BFF] focus:outline-none"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '16px',
                    lineHeight: '20px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#407BFF] transition-opacity hover:opacity-80"
                  aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                >
                  <img
                    src={showRepeatPassword ? eyeSlashIcon : eyeIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="mt-2 w-full rounded-[10px] bg-[#407BFF] py-2.5 px-7.5 font-medium text-white shadow-[0px_4px_8px_0px_rgba(64,123,255,0.34)] transition-all hover:shadow-[0px_4px_14px_0px_rgba(64,123,255,0.54)] active:shadow-none"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
            >
              Sign Up
            </button>
          </form>

          {/* Link to sign in */}
          <div className="mt-4">
            <Link
              to="/signin"
              className="text-[#407BFF] transition-colors hover:text-[#FF9D43]"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '20px',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
