import { useEffect, useState } from "react";
import axios from "axios";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY
);

const API_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`;

const PaymentForm = ({ booking }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [cardHolderName, setCardHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);


    // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    if (!stripe || !elements) {
      setError("Stripe not ready");
      setLoading(false);
      return;
    }

    if (!agree) {
      setError("You must agree to the terms to continue");
      setLoading(false);
      return;
    }
    const vehicleId = booking.vehicleId;
    const bookingId = booking._id

    const res = await axios.post(`${API_URL}/payment/create-payment`,{
      vehicleId, bookingId
    },{
      withCredentials: true,
    })

    console.log("res", res.data);
    if(!res.data.success){
      toast.error(res.data.message);
      setError(res.data.error);
      setLoading(false);
      return;
    }

    const clientSecret = res.data.clientSecret;

    try {
      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardHolderName,
          },
        },
      });

      if (result.error) {
        toast.error("Payment failed: " + result.error.message);
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        toast.success(res.data.message || "Payment successful" );
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handlePay}
      className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 space-y-5"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Payment method</h2>
        <p className="text-sm text-gray-500">
          Your information will be stored securely.
        </p>
      </div>

      {/* Card holder name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder name
        </label>
        <input
          type="text"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
          placeholder="John Doe"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          required
        />
      </div>

      {/* Card number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card number
        </label>
        <div className="rounded-lg border border-gray-300 px-3 py-2">
          <CardNumberElement />
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration date
          </label>
          <div className="rounded-lg border border-gray-300 px-3 py-2">
            <CardExpiryElement />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security code
          </label>
          <div className="rounded-lg border border-gray-300 px-3 py-2">
            <CardCvcElement />
          </div>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white">
          <option>Select country</option>
          <option>Sri Lanka</option>
          <option>United States</option>
          <option>United Kingdom</option>
        </select>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-700">
        <span>Total</span>
        <span className="text-lg font-bold text-gray-900">
          LKR {booking.totalAmount}
        </span>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" />
          <span>Send me promotions and announcements via email</span>
        </label> */}

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree to pay the total shown and accept the{" "}
            <span className="text-blue-600 underline cursor-pointer">
              terms & privacy policy
            </span>
          </span>
        </label>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Pay button */}
      <button
        disabled={loading}
        className="w-full bg-[#0D3778] text-white py-3 rounded-lg font-semibold hover:bg-[#0A2C63] transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};


const PaymentPage = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initPayment = async () => {
      try {
        const res = await axios.get(`${API_URL}/bookings/get/${bookingId}`, {
          withCredentials: true,
        });
        // console.log("res",res.data.data)
        setBooking(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load payment");
      }
    };

    if (bookingId) {
      initPayment();
    }
  }, [bookingId]);

  // console.log("Payment bookingId:", bookingId);


  if (error) return <p className="text-red-500">{error}</p>;
  if (!booking) return <p>Loading payment page...</p>;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm booking={booking} />
    </Elements>
  );
};

export default PaymentPage;
