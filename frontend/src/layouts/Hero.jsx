import React, { useState, useEffect } from 'react';
import { Loader2, Car } from 'lucide-react';

export const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the background image
    const img = new Image();
    img.src = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop';
    img.onload = () => {
      setImageLoaded(true);
      // Longer delay for smoother transition (2.5 seconds)
      setTimeout(() => setIsLoading(false), 2500);
    };
  }, []);

  // Background image style - applied directly to section for proper zoom behavior
  const backgroundImageStyle = imageLoaded 
    ? { backgroundImage: `url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop)` }
    : {};

  return (
    <section 
      className="relative h-screen w-full overflow-hidden bg-cover bg-center"
      style={backgroundImageStyle}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-gradient-to-br from-[#0d3778] to-[#1a4d99] flex items-center justify-center transition-opacity duration-1000">
          <div className="text-center">
            {/* Animated Car Logo */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center animate-pulse-slow">
                <Car className="w-12 h-12 text-white animate-bounce-slow" />
              </div>
              {/* Spinning circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-32 h-32 text-white/30 animate-spin-slow" strokeWidth={1} />
              </div>
            </div>
            
            {/* Loading Text - Words appear one by one */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <span className="animate-fadeInWord" style={{ animationDelay: '0ms' }}>Loading</span>
                <span className="animate-fadeInWord" style={{ animationDelay: '400ms' }}>Your</span>
                <span className="animate-fadeInWord" style={{ animationDelay: '800ms' }}>Journey</span>
              </h3>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce-slow" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce-slow" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce-slow" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-8 w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-white rounded-full animate-progress-slow"></div>
            </div>
          </div>
        </div>
      )}

      {/* Blue Overlay - lighter to show background image more clearly */}
      <div className={`absolute inset-0 bg-blue-900/45 transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Floating Animation */}
      <div className="absolute -top-1/2 -right-20 w-[600px] h-[600px] bg-white/5 rounded-full animate-float blur-3xl"></div>

      {/* Content with Staggered Animation */}
      <div className={`relative z-10 flex h-full items-center justify-center px-4 text-center ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}>
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-wide text-white mb-4 leading-tight">
            <span className={`inline-block transition-all duration-700 delay-300 ${isLoading ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>Your </span>
            <span className={`inline-block transition-all duration-700 delay-500 ${isLoading ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>Perfect </span>
            <span className={`inline-block transition-all duration-700 delay-700 ${isLoading ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>Ride </span>
            <span className={`inline-block transition-all duration-700 delay-900 ${isLoading ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>Awaits</span>
          </h1>
          <p className={`mt-4 text-lg text-white/80 md:text-xl max-w-3xl mx-auto transition-all duration-1000 delay-1100 ${
            isLoading ? 'opacity-0 translate-y-12' : 'opacity-100 translate-y-0'
          }`}>
            Discover amazing vehicles from trusted owners in your area. Rent by the day or week at unbeatable prices.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes progress-slow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes fadeInWord {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-progress-slow {
          animation: progress-slow 2.5s ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1.5s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-fadeInWord {
          opacity: 0;
          animation: fadeInWord 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};