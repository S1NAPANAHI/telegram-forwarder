import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../../components/ui/ThemeProvider';

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

const ModernAuth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl min-h-[600px] transition-colors duration-300">
        
        {/* Form Containers */}
        <div className="relative h-full flex">
          
          {/* Sign Up Form */}
          <motion.div 
            className={`absolute top-0 left-0 w-1/2 h-full bg-white dark:bg-gray-800 z-10 transition-all duration-700 ${
              isSignUp ? 'translate-x-full opacity-100' : 'translate-x-0 opacity-0'
            }`}
            animate={{ 
              x: isSignUp ? '100%' : '0%',
              opacity: isSignUp ? 1 : 0
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center px-12 h-full text-center">
              <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Create Account</h1>
              
              {/* Social Login Buttons */}
              <div className="flex space-x-4 mb-6">
                <button type="button" className="social-btn">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button type="button" className="social-btn">
                  <i className="fab fa-google"></i>
                </button>
                <button type="button" className="social-btn">
                  <i className="fab fa-telegram"></i>
                </button>
              </div>
              
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">or use your email for registration</span>
              
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="auth-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </motion.div>

          {/* Sign In Form */}
          <motion.div 
            className={`absolute top-0 left-0 w-1/2 h-full bg-white dark:bg-gray-800 z-20 transition-all duration-700 ${
              isSignUp ? 'translate-x-full' : 'translate-x-0'
            }`}
            animate={{ 
              x: isSignUp ? '100%' : '0%'
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center px-12 h-full text-center">
              <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Sign In</h1>
              
              {/* Social Login Buttons */}
              <div className="flex space-x-4 mb-6">
                <button type="button" className="social-btn">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button type="button" className="social-btn">
                  <i className="fab fa-google"></i>
                </button>
                <button type="button" className="social-btn">
                  <i className="fab fa-telegram"></i>
                </button>
              </div>
              
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">or use your account</span>
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
              
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4">
                Forgot your password?
              </a>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="auth-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </motion.div>

          {/* Overlay Container */}
          <motion.div 
            className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-blue-600 to-purple-600 text-white z-30 transition-all duration-700 ${
              isSignUp ? '-translate-x-full' : 'translate-x-0'
            }`}
            animate={{ 
              x: isSignUp ? '-100%' : '0%'
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <div className="relative h-full w-[200%] flex">
              
              {/* Welcome Back Panel */}
              <div className={`w-1/2 flex flex-col items-center justify-center px-8 text-center transform transition-transform duration-700 ${
                isSignUp ? 'translate-x-0' : '-translate-x-20'
              }`}>
                <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                <p className="text-lg mb-8 opacity-90">
                  To keep connected with us please login with your personal info
                </p>
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="overlay-button"
                >
                  Sign In
                </button>
              </div>

              {/* Hello Friend Panel */}
              <div className={`w-1/2 flex flex-col items-center justify-center px-8 text-center transform transition-transform duration-700 ${
                isSignUp ? 'translate-x-20' : 'translate-x-0'
              }`}>
                <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
                <p className="text-lg mb-8 opacity-90">
                  Enter your personal details and start your journey with us
                </p>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="overlay-button"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .auth-input {
          @apply bg-gray-100 dark:bg-gray-700 border-0 px-4 py-3 mb-4 w-full rounded-lg
                 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200;
        }
        
        .auth-button {
          @apply px-12 py-3 rounded-full text-white font-bold text-sm uppercase tracking-wider
                 transition-all duration-200 transform hover:scale-105 active:scale-95
                 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        
        .overlay-button {
          @apply px-12 py-3 rounded-full bg-transparent border-2 border-white text-white font-bold
                 text-sm uppercase tracking-wider transition-all duration-200 transform
                 hover:bg-white hover:text-blue-600 hover:scale-105 active:scale-95;
        }
        
        .social-btn {
          @apply w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600
                 flex items-center justify-center text-gray-600 dark:text-gray-400
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200;
        }
      `}</style>
    </div>
  );
};

export default ModernAuth;