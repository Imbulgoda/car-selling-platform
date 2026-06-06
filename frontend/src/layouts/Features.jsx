import React, { useState, useEffect, useRef } from 'react';
import { Shield, Clock, DollarSign, Headset, FileText, Smartphone } from 'lucide-react';

export const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const features = [
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Save up to 40% compared to traditional car rentals. Our peer-to-peer model cuts out the middleman.',
    },
    {
      icon: Shield,
      title: 'Verified Vehicles',
      description: 'All vehicles and owners are thoroughly verified for your safety and peace of mind.',
    },
    {
      icon: Clock,
      title: 'Flexible Rentals',
      description: 'Rent by the day or week. Pick up and drop off at convenient locations near you.',
    },
    {
      icon: Headset,
      title: '24/7 Support',
      description: 'Our customer support team is always here to help with any questions or concerns.',
    },
    {
      icon: FileText,
      title: 'Easy Documentation',
      description: 'Quick and simple verification process. Upload your documents and start renting in minutes.',
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Manage your bookings on the go with our easy-to-use mobile application.',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Triggers when 10% of section is visible
    );

    const currentSection = sectionRef.current;

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <div>
      <section className="py-12 sm:py-20" ref={sectionRef}>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0d3778] mb-4">
              Why Choose Rent My Car?
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Experience the future of car rental with our peer-to-peer platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white p-6 sm:p-10 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-[#0d3778] relative overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                  transitionDuration: '500ms',
                  transitionTimingFunction: 'ease-out'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0d3778] to-[#1a4d99] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#0d3778] to-[#1a4d99] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};