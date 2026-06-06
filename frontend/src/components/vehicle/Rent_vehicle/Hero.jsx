import React from 'react';
import { Link } from 'react-router-dom';
export function Hero() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
          'url("https://img.freepik.com/premium-photo/sports-cars-collection-wallpaper-bugatti_970779-1407.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>

        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/70 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center items-center md:items-end text-center md:text-right">
        <div className="max-w-3xl text-white space-y-4 md:space-y-6 transform -translate-y-8 md:-translate-y-12">
          <p className="text-base md:text-lg font-semibold tracking-wider uppercase opacity-90 text-blue-200 animate-fade-in">
            Looking to Rent Your Car?
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-serif leading-tight drop-shadow-2xl animate-slide-up">
            <span className="block mb-2">Interested in</span>
            <span className="block text-blue-300">Renting?</span>
          </h1>

          <p className="text-xl md:text-3xl font-medium opacity-95 pb-4 drop-shadow-lg animate-fade-in-delayed">
            Don't hesitate and reach <span className="text-blue-300 font-bold">RentmyCar.lk</span>
          </p>

          <Link
            to="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-110 hover:shadow-2xl shadow-xl mt-4 animate-bounce-in"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>);

}