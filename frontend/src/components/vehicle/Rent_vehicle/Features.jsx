import React from 'react';
import { Shield, LayoutGrid, FileText, CheckCircle } from 'lucide-react';

function FeatureCard({
  icon,
  title,
  description,
  align = 'left'
}) {
  return (
    <div
      className={`flex flex-col ${align === 'right' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} items-center text-center gap-4 max-w-sm`}>

      <div className="bg-[#1e3a5f] p-4 rounded-full shadow-lg text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>);

}
export function Features() {
  return (
    <section className="py-16 md:py-24 bg-[#f3f4f6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] font-serif mb-4">
            Rent Your Car Features
          </h2>
          <p className="text-gray-600">
            RentmyCar offers a seamless platform to rent out your car, ensuring
            security, easy management, and increased income. Enjoy 24/7 support,
            verified renters, and complete transparency in every transaction.
          </p>
        </div>

        {/* Features Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* Left Column Features */}
          <div className="space-y-12 md:space-y-24 flex flex-col items-center md:items-end">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Security & Assurance"
              description="Your car is protected with comprehensive insurance, background checks on renters, and 24/7 support."
              align="right" />

            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Earn Extra Income"
              description="List your car effortlessly and earn steady income with flexible booking options and no hassle."
              align="right" />

          </div>

          {/* Center Car Image */}
          <div className="relative flex justify-center py-8 md:py-0">
            <div className="relative w-full max-w-md aspect-[16/9] md:aspect-square flex items-center justify-center">
              {/* Using a red sports car image similar to the design */}
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop"
                alt="Red Sports Car"
                className="object-contain w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" />

            </div>
          </div>

          {/* Right Column Features */}
          <div className="space-y-12 md:space-y-24 flex flex-col items-center md:items-start">
            <FeatureCard
              icon={<LayoutGrid className="w-8 h-8" />}
              title="Ease of Management"
              description="Track bookings, manage availability, and communicate with renters all through RentmyCar's user-friendly app."
              align="left" />

            <FeatureCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Verified Renters Only"
              description="Rest assured with thorough renter verification, so your vehicle is in trusted hands each time."
              align="left" />

          </div>
        </div>
      </div>
    </section>);

}