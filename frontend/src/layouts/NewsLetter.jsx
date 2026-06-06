import React, { useState } from "react";
import { Car, Check, ChevronRight, Apple, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NewsLetter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const appFeatures = [
    "Instant booking & confirmations",
    "Real-time notifications",
    "Secure in-app payments",
    "24/7 customer support",
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:8090/api/v1/subscription/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setEmail(""); // Clear the input on success
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ 
        text: "Failed to subscribe. Please try again later.", 
        type: "error" 
      });
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {" "}
      <section className="bg-gradient-to-br from-[#1a4d99] to-[#0d3778] py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-white order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Get Our Mobile App
              </h2>
              <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 leading-relaxed">
                Take Rent My Car with you wherever you go. Book cars, manage
                rentals, and chat with owners all from your phone.
              </p>
              <ul className="space-y-4 mb-6 sm:mb-8">
                {appFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 text-base sm:text-lg"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#"
                  className="flex items-center gap-3 px-6 py-4 bg-white text-[#0d3778] rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <Apple className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs font-normal">Download on the</div>
                    <div className="text-base">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-6 py-4 bg-white text-[#0d3778] rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <Play className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs font-normal">GET IT ON</div>
                    <div className="text-base">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-64 h-[500px] sm:w-80 sm:h-[600px] bg-gradient-to-br from-white/10 to-white/5 rounded-[3rem] p-4 shadow-2xl border-3 border-white/20">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/30 rounded-full"></div>
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600&fit=crop"
                    alt="App Screenshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0d3778] mb-4 max-w-4xl mx-auto">
            Stay Updated
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8 max-w-4xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new vehicle
            listings, and travel tips
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto px-4">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0d3778] transition-colors text-base"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 sm:px-10 py-4 bg-[#0d3778] text-white rounded-xl font-semibold hover:bg-[#082555] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          
          {/* Success/Error Message */}
          {message.text && (
            <div className={`mt-4 p-4 rounded-lg max-w-2xl mx-auto ${
              message.type === "success" 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0d3778] mb-4 sm:mb-5 max-w-4xl mx-auto">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-xl text-gray-500 mb-6 sm:mb-10 max-w-4xl mx-auto">
            Join thousands of satisfied customers and experience the future of
            car rental
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center">
            <button
              onClick={() => navigate("/vehicles")}
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-[#0d3778] text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-[#082555] hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Car className="w-5 h-5" />
              Browse Cars
            </button>

            <button
              onClick={() => navigate("/rent-vehicle")}
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-white text-[#0d3778] border-2 border-[#0d3778] rounded-xl font-semibold text-base sm:text-lg hover:bg-[#0d3778] hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
              List Your Car
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};