import React from 'react'

export const Guide = () => {
     const steps = [
    { number: 1, title: 'Search', description: 'Find your perfect car by location, date, and vehicle type' },
    { number: 2, title: 'Book', description: 'Select your car and confirm your booking instantly' },
    { number: 3, title: 'Upload Docs', description: 'Provide required documents for verification' },
    { number: 4, title: 'Drive', description: 'Pick up your car and enjoy your journey!' },
  ];
  return (
    <div> <section className="py-12 sm:py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0d3778] mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Get on the road in just four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {/* Connection Line (hidden on mobile) */}
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-linear-to-r from-[#0d3778] to-[#1a4d99]"></div>

            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative bg-white p-6 sm:p-10 rounded-2xl text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 z-10"
              >
                <div className="w-14 h-14 bg-[#0d3778] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white relative z-20">
                  {step.number}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section></div>
  )
}
