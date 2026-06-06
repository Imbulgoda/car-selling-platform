import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/Rent My Car.png';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    //confome password
    if (formData.password !== formData.confirmPassword) { 
      toast.error('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    try {
      const url = `${baseUrl}${apiVersion}/authUser/register`;           
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},      
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Registration successful! Please verify your email');
        navigate('/login');
         
      } 
      else 
        {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration failed:', response.status, errorData);
        toast.error(`Registration failed: ${errorData.message || 'Unknown error'}`);
      }
    }
    catch (error) {
      console.error('Error during registration:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
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

      {/* Right Panel - Form Content */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="text-gray-500">Start your journey with us today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-900">

                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  required
                  className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      first_name: e.target.value
                    })
                  } />

              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-900">

                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500"
                  value={formData.last_name}
                  onChange={(e) =>  
                    setFormData({...formData,last_name: e.target.value })   } />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900">

                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
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
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-900">

                  Phone
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactNumber: e.target.value
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
                    placeholder="Create a password"
                    required
                    minLength={8}
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

                <p className="text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-900">

                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500 pr-10"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value
                      })
                    } />
                   <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.userType === 'owner' ? 'border-[#0A2E5C]' : 'border-gray-300'}`}>

                  {formData.userType === 'owner' &&
                    <div className="w-3 h-3 rounded-full bg-[#0A2E5C]" />
                  }
                </div>
                <input
                  type="radio"
                  name="userType"
                  value="owner"
                  className="hidden"
                  checked={formData.userType === 'owner'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userType: e.target.value
                    })
                  } />

                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Vehicle Owner
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.userType === 'customer' ? 'border-[#0A2E5C]' : 'border-gray-300'}`}>

                  {formData.userType === 'customer' &&
                    <div className="w-3 h-3 rounded-full bg-[#0A2E5C]" />
                  }
                </div>
                <input
                  type="radio"
                  name="userType"
                  value="customer"
                  className="hidden"
                  checked={formData.userType === 'customer'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userType: e.target.value
                    })
                  } />

                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Customer
                </span>
              </label>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0A2E5C] focus:ring-[#0A2E5C]"
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    agreeTerms: e.target.checked
                  })
                } />

              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-[#0A2E5C] font-medium hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#0A2E5C] font-medium hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A2E5C] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2E5C] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">

              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-sm text-gray-500">
              If have an already account?{' '}
              <Link
                to="/login"
                className="font-medium text-[#0A2E5C] hover:text-blue-800">

                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>);

}
