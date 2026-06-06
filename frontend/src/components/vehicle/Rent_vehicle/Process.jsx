import React from 'react';
import { UserPlus, MessageSquare, ClipboardCheck, Car, CalendarCheck, KeyRound } from 'lucide-react';

function ProcessStep({ number, title, description, icon }) {
  return (
    <div className="flex flex-col items-center text-center text-white group cursor-pointer transition-all duration-300 transform hover:scale-105">
      <div className="mb-4 p-4 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-[#0D3778] transition-all duration-300 transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-sm md:text-base font-bold mb-2 leading-tight max-w-[180px] group-hover:text-[#5BA3D0] transition-colors">
        {title}
      </h3>
      <p className="text-xs text-white/70 mb-4 max-w-[200px] leading-relaxed group-hover:text-white/90 transition-colors">
        {description}
      </p>
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0D3778] to-[#051d3d] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-2xl group-hover:from-[#1a5fa8] group-hover:to-[#0D3778] transition-all transform group-hover:scale-110">
        {number}
      </div>
    </div>
  );
}
export function Process() {
  const steps = [
    {
      number: "01",
      title: "Sign Up, Rent my Car and Verification",
      description: "Go to our Location or Contact RentmyCar.lk to enlist.",
      icon: <UserPlus className="w-8 h-8" />
    },
    {
      number: "02", 
      title: "Discuss Pricing and Terms",
      description: "Talk to our team, share and set availability.",
      icon: <MessageSquare className="w-8 h-8" />
    },
    {
      number: "03",
      title: "Physical Inspection and Documentation",
      description: "Inspect car condition, take photos and documentation.",
      icon: <ClipboardCheck className="w-8 h-8" />
    },
    {
      number: "04",
      title: "List Car and Set Preferences",
      description: "Add details, photos, and setup pricing settings.",
      icon: <Car className="w-8 h-8" />
    },
    {
      number: "05",
      title: "Receive and Approve Bookings",
      description: "Get booking requests and approve the best fit customers.",
      icon: <CalendarCheck className="w-8 h-8" />
    },
    {
      number: "06",
      title: "Car Handover to \"Verified\" Renter",
      description: "Verify Renter documentation, verify car and keys then handover.",
      icon: <KeyRound className="w-8 h-8" />
    }
  ];
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background with car image and overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=2070&auto=format&fit=crop')",
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.7)_100%)]"></div>
      </div>
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4 drop-shadow-lg">
            How It Works
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Simple, straightforward process to get your car rented out and start earning passive income
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#0D3778] to-[#1a5fa8] mx-auto mt-6 rounded-full"></div>
        </div>
        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <ProcessStep
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}