import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const containerRef = useRef(null);
  const slideIntervalRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiVersion = import.meta.env.VITE_API_VERSION;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        
        const url = `http://localhost:8090/api/v1/reviews/home`;
        console.log('Fetching testimonials from:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch testimonials: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched testimonials:', data);
        
        if (data.success && Array.isArray(data.reviews)) {
          setTestimonials(data.reviews);
        } else {
          setTestimonials([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err.message);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [baseUrl, apiVersion]);

  // Update visible items based on screen size
  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleItems(3);
      } else if (width >= 640) {
        setVisibleItems(2);
      } else {
        setVisibleItems(1);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  // Helper functions
  const getCustomerName = (testimonial) => {
    if (testimonial.customer_id) {
      const { first_name, last_name } = testimonial.customer_id;
      if (first_name && last_name) {
        return `${first_name} ${last_name}`;
      }
      if (first_name) return first_name;
    }
    return 'Anonymous';
  };

  const getInitials = (name) => {
    if (!name || name === 'Anonymous') return 'AN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate max index
  const maxIndex = Math.max(0, testimonials.length - visibleItems);

  // Auto-play functionality
  useEffect(() => {
    if (testimonials.length <= visibleItems) return;

    const startAutoPlay = () => {
      slideIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= maxIndex) {
            return 0;
          }
          return prev + 1;
        });
      }, 3000);
    };

    startAutoPlay();

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [testimonials.length, visibleItems, maxIndex]);

  // Navigation handlers
  const goToNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    resetAutoPlay();
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(maxIndex);
    }
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
    if (testimonials.length > visibleItems) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= maxIndex) {
            return 0;
          }
          return prev + 1;
        });
      }, 3000);
    }
  };

  if (loading) {
    return (
      <section className="py-12 mt-16 mb-16 sm:py-20 bg-gradient-to-br from-[#0d3778] to-[#1a4d99] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied renters
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      <section className="py-12 mt-16 mb-16 sm:py-20 bg-gradient-to-br from-[#0d3778] to-[#1a4d99] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied renters
            </p>
          </div>

          {error ? (
            <div className="text-center text-white/70">
              <p className="mb-2">⚠️ Failed to load reviews</p>
              <p className="text-sm opacity-60">{error}</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center text-white/70">
              <p>No reviews available at the moment.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Buttons */}
              {testimonials.length > visibleItems && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-all duration-300 border border-white/30"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-all duration-300 border border-white/30"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Testimonials Container */}
              <div ref={containerRef} className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out gap-4 lg:gap-10"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                  }}
                >
                  {testimonials.map((testimonial, index) => {
                    const customerName = getCustomerName(testimonial);
                    
                    return (
                      <div
                        key={testimonial._id || index}
                        className="flex-shrink-0"
                        style={{
                          width: visibleItems === 1 
                            ? '100%' 
                            : visibleItems === 2 
                            ? 'calc(50% - 0.5rem)' 
                            : 'calc(33.333% - 1.667rem)'
                        }}
                      >
                        <div className="h-full bg-white/15 backdrop-blur-md p-6 sm:p-10 rounded-2xl border border-white/20 hover:bg-white/20 hover:-translate-y-2 transition-all duration-300">
                          {/* Rating with stars */}
                          <div className="flex gap-1 text-yellow-400 mb-5 text-xl">
                            {[...Array(testimonial.rate || 5)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-yellow-400" />
                            ))}
                          </div>
                          
                          {/* Feedback text */}
                          <p className="text-base sm:text-lg mb-7 opacity-95 leading-relaxed line-clamp-4">
                            "{testimonial.feedback}"
                          </p>
                          
                          {/* Customer info with name and date */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-[#0d3778] rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {getInitials(customerName)}
                            </div>
                            <div>
                              <div className="font-semibold text-base sm:text-lg">
                                {customerName}
                              </div>
                              <div className="text-sm opacity-80">
                                {formatDate(testimonial.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots Indicator */}
              {testimonials.length > visibleItems && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        resetAutoPlay();
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        currentIndex === index
                          ? 'w-8 h-3 bg-white'
                          : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};