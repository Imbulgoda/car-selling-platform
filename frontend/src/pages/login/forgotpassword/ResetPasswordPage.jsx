import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../../components/AuthLayout';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '', 
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const email = location.state?.email 

  const handleSubmit =async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);

    try{
      const response = await axios.patch(`${baseUrl}${apiVersion}/authUser/ResetPassword`,
        { email, password: formData.password });
      if(response.status === 200){
        toast.success('Password successfully reset!');
        navigate('/login', { state: { email } });
      }
    }
    catch(error){
      toast.error(error.response.data.message);
    }

  };
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previous passwords.">

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-900">


              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-[#0d3778] focus:ring-2 focus:ring-[#0d3778]/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500 pr-10"
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

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-900">

              Confirm Password
            </label>
              <input
                id="confirmPassword"
              type="password"
                placeholder="••••••••"
                required
              className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-[#0d3778] focus:ring-2 focus:ring-[#0d3778]/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500"
                value={formData.confirmPassword}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value
                })
                } />

          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0d3778] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d3778] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">

          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>);

}