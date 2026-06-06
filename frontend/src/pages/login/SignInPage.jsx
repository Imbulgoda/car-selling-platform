import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/Rent My Car.png';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export function SignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    

    try {
      const url = `${baseUrl}${apiVersion}/authUser/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Login API Response:', data); 

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        toast.success(data.message || "Login Successfully");
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ userid: data.userid, role: data.role }));
        navigate('/');

      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message || "Server Side Error");

    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Panel - Brand & Hero */}
      <div className="w-full lg:w-[40%] bg-[#0A2E5C] p-8 lg:p-12 flex flex-col justify-between text-white min-h-[300px] lg:min-h-screen relative overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Rent My Car" className="w-12 h-12 object-contain" />
          <span className="text-xl font-medium tracking-wide">Rent My Car</span>
        </div>

        {/* Hero Content */}
        <div className="my-12 lg:my-0 relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Drive your dreams today.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Experience the freedom of the open road with our premium fleet.
            Reliable, comfortable, and ready when you are.
          </p>
        </div>

        {/* Footer Copyright */}
        <div className="text-sm text-blue-300/80">
          © 2026 Rent My Car. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form Conten*/}
      <div className="w-full lg:w-[60%] bg-white flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900">

                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  } />

              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-900">


                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500 pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value
                      })
                    } />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#0A2E5C] focus:ring-[#0A2E5C]"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rememberMe: e.target.checked
                    })
                  } />

                <span className="text-sm text-gray-600">
                  Remember me for 30 days
                </span>
              </label>

              <button
                type="button"
                className="text-sm font-medium text-[#0A2E5C] hover:text-blue-800"
                onClick={() => navigate('/forgot-password')}>

                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A2E5C] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2E5C] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">

              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-[#0A2E5C] hover:text-blue-800">

                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
    
    
  );

}

    