import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const base = useMemo(
    () => `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`,
    []
  );

  const ranOnce = useRef(false);

  const [msg, setMsg] = useState("Verifying your email...");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token missing, just set message async
    if (!token) {
      setMsg("Invalid verification link.");
      setLoading(false);
      return;
    }

    // prevent double-call in React StrictMode (dev)
    if (ranOnce.current) return;
    ranOnce.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `${base}/authUser/verify-email?token=${encodeURIComponent(token)}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setOk(true);
          setMsg(data.message || "Email verified successfully!");
        } else {
          setOk(false);
          setMsg(data.message || "Verification failed.");
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          setOk(false);
          setMsg("Network error. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [token, base]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          {loading ? (
            <Loader2 className="w-16 h-16 text-[#0A2E5C] animate-spin" />
          ) : ok ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {loading ? "Verifying..." : ok ? "Verified!" : "Verification Failed"}
        </h2>

        <p className="text-gray-600 mb-8">{msg}</p>

        {!loading && (
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#0A2E5C] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2E5C] transition-colors"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
}
