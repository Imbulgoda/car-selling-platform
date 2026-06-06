import React, { useState, useEffect } from "react";
import {
  Car,
  Users,
  MapPin,
  Star,
  Headset,
  Award,
  Lock,
  BadgeCheck,
} from "lucide-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export const Stats = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isTrustVisible, setIsTrustVisible] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const stats = [
    {
      icon: Car,
      number: `${vehicleCount}+`,
      value: vehicleCount,
      label: "Vehicles Available",
    },
    {
      icon: Users,
      number: `${userCount}+`,
      value: userCount,
      label: "Happy Customers",
    },
    { icon: MapPin, number: "25+", value: 25, label: "Cities Covered" },
    {
      icon: Star,
      number: "4.9",
      value: 4.9,
      label: "Average Rating",
      isDecimal: true,
    },
  ];

  const trustBadges = [
    { icon: Award, text: "Award Winning" },
    { icon: Headset, text: "24/7 Support" },
    { icon: Lock, text: "Verified Secure" },
    { icon: BadgeCheck, text: "Certified Platform" },
  ];

  // Fetch vehicle count from API
  useEffect(() => {
    const fetchVehicleCount = async () => {
      try {
        setIsLoading(true);
        const url = `http://localhost:8090/api/v1/vehicle/vehicle-count`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch vehicle count");
        }

        const data = await response.json();

        if (data.success && typeof data.count === "number") {
          setVehicleCount(data.count);
        } else {
          console.error("Invalid response format:", data);
          // Fallback to 0 or keep default
          setVehicleCount(0);
        }
      } catch (error) {
        console.error("Error fetching vehicle count:", error);
        // Optionally set a fallback value
        setVehicleCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleCount();
  }, []);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const url = `http://localhost:8090/api/v1/authUser/getAllCustomersCount`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user count");
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.users)) {
          setUserCount(data.users.length);
        } else {
          console.error("Invalid response format:", data);
          setUserCount(0);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
        setUserCount(0);
      }
    };

    fetchUserCount();
  }, []);

  useEffect(() => {
    if (!isStatsVisible) return;

    const duration = 2000; // 2 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = duration / frameRate;
    const intervals = [];

    stats.forEach((stat, index) => {
      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Easing function
        const currentValue = easeOutQuart * stat.value;

        setCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          newCounts[index] = currentValue;
          return newCounts;
        });

        if (frame >= totalFrames) {
          clearInterval(counter);
          setCounts((prevCounts) => {
            const newCounts = [...prevCounts];
            newCounts[index] = stat.value;
            return newCounts;
          });
        }
      }, frameRate);

      intervals.push(counter);
    });

    // Cleanup function to clear all intervals
    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isStatsVisible, vehicleCount]); // Add vehicleCount as dependency

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes marquee {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }
      .animate-marquee {
        animation: marquee 15s linear infinite;
      }
      .marquee-container:hover .animate-marquee {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const formatNumber = (value, isDecimal) => {
    if (isDecimal) {
      return value.toFixed(1);
    }
    return Math.floor(value).toLocaleString();
  };

  return (
    <div>
      <section
        className="bg-white py-12 sm:py-16 border-b border-gray-200 w-full"
        onMouseEnter={() => setIsStatsVisible(true)}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-4 sm:p-8 hover:-translate-y-2 transition-all duration-300 ${
                  isStatsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  transition: "all 0.6s ease-out",
                }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0d3778] to-[#1a4d99] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg">
                  <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0d3778] mb-2">
                  {isLoading && index === 0 ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    <>
                      {formatNumber(counts[index], stat.isDecimal)}
                      {stat.isDecimal ? "" : "+"}
                    </>
                  )}
                </div>
                <div className="text-sm sm:text-base text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Trust Badges */}
      <section
        className="bg-gradient-to-b from-[#E2E8F0] to-[#E2E8F0] py-12"
        onMouseEnter={() => setIsTrustVisible(true)}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24">
          <div className="marquee-container overflow-hidden">
            <div className="flex flex-nowrap animate-marquee space-x-6 sm:space-x-8">
              {[...trustBadges, ...trustBadges].map((badge, idx) => (
                <div
                  key={idx}
                  className={`text-center p-6 rounded-xl hover:shadow-lg transition-all duration-500 min-w-[150px] sm:min-w-[200px] ${
                    isTrustVisible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90"
                  }`}
                  style={{
                    transitionDelay: `${(idx % trustBadges.length) * 100}ms`,
                  }}
                >
                  <badge.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#0D3778] mx-auto mb-3" />
                  <div className="text-xs sm:text-sm text-[#999FA8] font-semibold">
                    {badge.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
