import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../../components/AuthLayout';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Get email from previous step or default
  const email = location.state?.email || 'your email';


  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}${apiVersion}/authUser/verifyOTP`,
         { email, otp: code });
      if(response.status === 200){
        toast.success('Verification code verified successfully');
      }
      setTimeout(() => {
        setIsLoading(false);
        navigate('/reset-password', { state: { email } });
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response.data.message);
    }
  };
  const handleResend = async() => {
    if (countdown > 0) return;
    
    try{
      const response = await axios.post(`${baseUrl}${apiVersion}/authUser/passwordRestOTP`, { email });
      if(response.status === 200){
        toast.success('Verification code resent to your email');
        setCountdown(20);
      }
    }
    catch(error){
      toast.error(error.response.data.message);
    }

  };
  return (
    <AuthLayout
      title="Enter verification code"
      subtitle={`We sent a code to ${email}`}>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-gray-900">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            placeholder="123456"
            maxLength={6}
            required
            className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-[#0d3778] focus:ring-2 focus:ring-[#0d3778]/20 rounded-lg transition-all outline-none text-gray-900 placeholder-gray-500 tracking-widest text-lg"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0d3778] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d3778] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">

          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className={`font-medium transition-colors ${
                countdown > 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-[#0d3778] hover:text-red-800'
              }`}>

              {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
            </button>
          </p>

          <Link
            to="/forgot-password"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#0d3778] transition-colors">

            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email
          </Link>
        </div>
      </form>
    </AuthLayout>);

}