import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '../../../components/AuthLayout';
import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;


export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);


//handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  try {
    const response =  await axios.post(`${baseUrl}${apiVersion}/authUser/passwordRestOTP`, { email });
    setTimeout(() => {
      setIsLoading(false);
      navigate('/verify-code', {
        state: {email}
      });
    }, 1000);
    toast.success("OTP sent successfully");
  }
  catch(error){
    setIsLoading(false);
    toast.error(error.response.data.message);
  }

 
  };
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email to receive a verification code.">

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-[#0d3778] focus:ring-2 focus:ring-[#0d3778]/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0d3778] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d3778] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">

          {isLoading ? 'Sending Code...' : 'Send Code'}
        </button>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#0d3778] transition-colors">

            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>);

}