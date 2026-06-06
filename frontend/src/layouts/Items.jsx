import React, { useState, useEffect } from 'react'
import { Car, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Items = () => { 
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8090/api/v1/vehicle/top-booked');
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const data = await response.json();
        
        // The API returns { success, count, vehicles: [...] }
        // Extract the vehicles array from the response
        if (data.success && data.vehicles) {
          setCars(data.vehicles);
        } else {
          setCars([]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center">
            <p className="text-lg text-gray-500">Loading popular cars...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center">
            <p className="text-lg text-red-500">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center">
            <p className="text-lg text-gray-500">No popular cars available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0d3778] mb-4">
              Popular Cars
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Most booked vehicles on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {cars.map((item, index) => {
              // Safely extract vehicle data with fallbacks
              const car = item?.vehicle || {};
              const firstPhoto = car.photos && car.photos.length > 0 ? car.photos[0].url : '';
              
              // Skip rendering if no photo exists
              if (!firstPhoto) {
                return null;
              }
              
              const imageUrl = `http://localhost:8090${firstPhoto}`;
              
              return (
                <div 
                  key={car._id || index}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative flex flex-col"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-[#0d3778]/10 to-[#1a4d99]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  <div className="overflow-hidden h-48 sm:h-56">
                    <img 
                      src={imageUrl}
                      alt={car.title || 'Vehicle'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 sm:p-7 relative z-20 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 text-center">
                      {car.title || 'Untitled Vehicle'}
                    </h3>
                    <div className="flex justify-center gap-4 text-gray-500 text-sm mb-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {car.seats || 0} Seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4" /> {car.transmission || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" /> 
                        {item.bookingCount || 0} bookings
                      </span>
                    </div>
                    <div className="flex flex-col items-center pt-4 border-t border-gray-200 mt-auto">
                      <div className="mb-4 text-center">
                        <span className="text-2xl font-bold text-[#0d3778]">
                          LKR {(car.pricePerDay || 0).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/day</span>
                      </div>
                      <button onClick={() => navigate("/vehicles")} className="w-full bg-[#0d3778] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d3778] transition font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  )
}