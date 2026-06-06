import React from 'react';
import { Clock, Bolt, Percent, CheckCircle } from 'lucide-react';

export const QuickStats = () => {
  const quickStats = [
    { icon: Bolt, number: 'Instant', label: 'Booking Confirmation' },
    { icon: Percent, number: '40%', label: 'Cheaper Than Traditional' },
    { icon: Clock, number: '2 Min', label: 'Average Signup Time' },
    { icon: CheckCircle, number: '100%', label: 'Verified Vehicles' },
  ];

  // Triple the stats for seamless infinite scroll
  const duplicatedStats = [...quickStats, ...quickStats, ...quickStats];

  return (
    <div>
      <section className="bg-gradient-to-br from-[#0d3778] to-[#1a4d99] py-8 overflow-hidden">
        <div className="relative">
          {/* Right to Left Marquee */}
          <div className="flex animate-marquee-rtl hover:pause-animation">
            {duplicatedStats.map((stat, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-8 sm:px-12 lg:px-16"
              >
                <div className="text-white text-center whitespace-nowrap">
                  <div className="text-2xl sm:text-3xl font-bold mb-1 flex items-center justify-center gap-2">
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes marquee-rtl {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-marquee-rtl {
          animation: marquee-rtl 20s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};