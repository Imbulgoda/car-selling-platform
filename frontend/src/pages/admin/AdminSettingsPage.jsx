import React, { useMemo, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { updateEmailNotify, getUserDetails } from "../../services/settingsApi";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";

export default function AdminSettingsPage() {
  const [active, setActive] = useState("general");
  const navigate = useNavigate();
  const [loadingUser, setLoadingUser] = useState(true);

  const scrollRef = useRef(null);
  const isClickScrolling = useRef(false);

  const [form, setForm] = useState({
    platformInfo: {
      supportEmail: "support@rentmycar.com",
      contactNumber: "+94 77 123 4567",
      platformStatus: "Active",
      defaultCurrency: "LKR",
    },
    operatingHours: {
      supportHours: "Mon-Fri: 9AM - 6PM",
      timezone: "Asia/Colombo",
    },
    notifications: { email: true },
    security: {
      twoFactorEnabled: true,
      sessionTimeoutMinutes: 30,
      minPasswordLength: 8,
      dataRetentionDays: 30,
    },
    terms: {
      termsOfService: "",
      privacyPolicy: "",
      cancellationPolicy: "",
    },
    localization: {
      defaultLanguage: "English",
      defaultCurrency: "LKR",
      dateFormat: "DD.MM.YYYY",
      distanceUnit: "km",
    },
    payment: {
      platformCommissionRate: 15,
      minBookingAmount: 1000,
      acceptedPaymentMethods: [
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "Digital Wallet",
      ],
    },
  });

  const navItems = useMemo(
    () => [
      { key: "general", label: "General Settings", target: "sec-general" },
      {
        key: "notifications",
        label: "Notification Settings",
        target: "sec-notifications",
      },
      {
        key: "security",
        label: "Security and Privacy",
        target: "sec-security",
      },
      { key: "terms", label: "Terms & Policies", target: "sec-terms" },
      {
        key: "localization",
        label: "Localization",
        target: "sec-localization",
      },
      { key: "payment", label: "Payment Settings", target: "sec-payment" },
    ],
    [],
  );

  useEffect(() => {
    const loadUserPref = async () => {
      try {
        setLoadingUser(true);
        const res = await getUserDetails();

        const emailNotifyRaw = res?.data?.emailNotify ?? res?.user?.emailNotify;

        // backend returns "on"/"off"
        const emailNotifyBool =
          emailNotifyRaw === "on"
            ? true
            : emailNotifyRaw === "off"
              ? false
              : !!emailNotifyRaw;

        setForm((p) => ({
          ...p,
          notifications: { ...p.notifications, email: emailNotifyBool },
        }));
      } catch (err) {
        if (err?.response?.status === 401) {
          toast.error("Please login again");
          navigate("/login");
        } else {
          console.log(err);
        }
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserPref();
  }, [navigate]);

  useEffect(() => {
    const rootEl = mainRef.current;
    const sections = navItems
      .map((n) => document.getElementById(n.target))
      .filter(Boolean);

    if (!rootEl || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;

        // pick section closest to top (stable)
        const visibleEntries = entries.filter((e) => e.isIntersecting);

        if (!visibleEntries.length) return;

        const topMost = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        )[0];

        const found = navItems.find((n) => n.target === topMost.target.id);
        if (found) setActive(found.key);
      },
      {
        root: rootEl,
        threshold: [0.1, 0.2, 0.3, 0.4],
        rootMargin: "-10% 0px -80% 0px", // key: makes top section win
      },
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [navItems]);

  const scrollTo = (key, target) => {
    setActive(key);
    isClickScrolling.current = true;

    const rootEl = mainRef.current;
    const el = document.getElementById(target);

    if (rootEl && el) {
      const top = el.offsetTop - 16; // small padding
      rootEl.scrollTo({ top, behavior: "smooth" });
    }

    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  const onSaveUIOnly = () => {
    console.log("FORM:", form);
    toast.success("Updated");
  };

  const mainRef = useRef(null);

  return (
    <Layout>
      <div className="h-screen bg-slate-50 flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#0d3778]">Settings</h1>
              <p className="text-sm text-slate-500">
                Manage your platform configuration and performance
              </p>
            </div>
            <button
              onClick={onSaveUIOnly}
              className="self-start sm:self-auto h-10 px-5 rounded-lg bg-[#0D3778] text-white font-semibold hover:opacity-95"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 h-full">
            {/* Sidebar */}
            <aside className="self-start">
              {/* Mobile Tabs */}
              <div className="lg:hidden bg-white border rounded-2xl p-2 overflow-x-auto">
                <div className="flex gap-2 w-max">
                  {navItems.map((it) => (
                    <button
                      key={it.key}
                      onClick={() => scrollTo(it.key, it.target)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition
                    ${
                      active === it.key
                        ? "bg-[#0D3778] text-white"
                        : "bg-slate-100 text-[#0d3778]"
                    }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden lg:block bg-white border rounded-2xl p-3 max-h-[calc(100vh-7rem)] overflow-y-auto">
                {navItems.map((it) => (
                  <button
                    key={it.key}
                    onClick={() => scrollTo(it.key, it.target)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition
                  ${
                    active === it.key
                      ? "bg-[#0D3778]/10 text-[#0D3778]"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Content */}
            <main ref={mainRef} className="space-y-6 overflow-y-auto pr-2">
              {/* General Settings */}
              <section
                id="sec-general"
                className="bg-white border rounded-2xl p-5 scroll-mt-6"
              >
                <h2 className="text-lg font-bold text-[#0d3778]">
                  General Settings
                </h2>

                <div className="mt-4 border rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-[#0D3778]">
                    Platform Information
                  </h3>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyRow
                      label="Support Email"
                      value={form.platformInfo.supportEmail}
                    />
                    <ReadOnlyRow
                      label="Contact Number"
                      value={form.platformInfo.contactNumber}
                    />
                    <ReadOnlyRow
                      label="Platform Status"
                      value={form.platformInfo.platformStatus}
                    />
                    <ReadOnlyRow
                      label="Default Currency"
                      value={form.platformInfo.defaultCurrency}
                    />
                  </div>
                </div>

                <div className="mt-4 border rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-[#0D3778]">
                    Operating Hours
                  </h3>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyRow
                      label="Support Hours"
                      value={form.operatingHours.supportHours}
                    />
                    <ReadOnlyRow
                      label="Timezone"
                      value={form.operatingHours.timezone}
                    />
                  </div>
                </div>
              </section>

              {/* Notification Settings */}
              <section
                id="sec-notifications"
                className="bg-white border rounded-2xl p-5 scroll-mt-6"
              >
                <h2 className="text-lg font-bold text-[#0d3778]">
                  Notification Settings
                </h2>

                {loadingUser && (
                  <p className="text-sm text-slate-500 mt-2">Loading...</p>
                )}

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <ToggleRow
                    title="Email Notifications"
                    subtitle="Receive notifications via email"
                    checked={form.notifications.email}
                    onChange={async (v) => {
                      setForm((p) => ({
                        ...p,
                        notifications: { ...p.notifications, email: v },
                      }));

                      try {
                        await updateEmailNotify(v);
                        toast.success("Email notification updated");
                      } catch (err) {
                        setForm((p) => ({
                          ...p,
                          notifications: { ...p.notifications, email: !v },
                        }));

                        if (err?.response?.status === 401) {
                          toast.error("Session expired. Login again.");
                          navigate("/login");
                        } else {
                          toast.error(
                            err?.response?.data?.message ||
                              err?.message ||
                              "Update failed",
                          );
                        }
                      }
                    }}
                  />
                </div>
              </section>

              {/* Security */}
              <section
                id="sec-security"
                className="bg-white border rounded-2xl p-5 scroll-mt-28"
              >
                <h2 className="text-lg font-bold text-[#0d3778]">
                  Security and Privacy
                </h2>

                <div className="mt-4 border rounded-2xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyRow
                      label="Two-Factor Authentication"
                      value={
                        form.security.twoFactorEnabled ? "Enabled" : "Disabled"
                      }
                    />
                    <ReadOnlyRow
                      label="Session Timeout (minutes)"
                      value={String(form.security.sessionTimeoutMinutes)}
                    />
                    <ReadOnlyRow
                      label="Minimum Password Length"
                      value={String(form.security.minPasswordLength)}
                    />
                    <ReadOnlyRow
                      label="Data Retention Period (days)"
                      value={String(form.security.dataRetentionDays)}
                    />
                  </div>
                </div>
              </section>

              {/* Terms */}
              <section
                id="sec-terms"
                className="bg-white border rounded-2xl p-5 scroll-mt-6"
              >
                <h2 className="text-lg font-bold text-[#0d3778]">
                  Terms and Policies
                </h2>

                <div className="mt-4 border rounded-2xl p-4">
                  <ReadOnlyRow
                    label="Terms of Service"
                    value={`By using this rental car platform, you agree to provide accurate information and use vehicles responsibly. Vehicles must be returned on time and in good condition.

                The platform connects customers and vehicle owners and is not responsible for accidents, damages, or violations during rentals. Breaking rules may lead to account suspension.`}
                  />
                </div>

                <div className="mt-4 border rounded-2xl p-4">
                  <ReadOnlyRow
                    label="Privacy Policy"
                    value={`We collect basic information like name, contact details, and booking data to manage rentals and payments.

                Your data is kept secure and used only for platform services, safety, and support. We do not sell your personal information.`}
                  />
                </div>

                <div className="mt-4 border rounded-2xl p-4">
                  <ReadOnlyRow
                    label="Cancellation Policy"
                    value={`Cancel 24+ hours before pickup → Full refund
                        Cancel 12–24 hours before → 50% refund
                        Cancel under 12 hours → No refund`}
                  />
                </div>
              </section>

              {/* Localization */}
              <section
                id="sec-localization"
                className="bg-white border rounded-2xl p-5 scroll-mt-6"
              >
                <h2 className="text-lg font-bold text-slate-900">
                  Localization
                </h2>

                <div className="mt-4 border rounded-2xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyRow
                      label="Default Language"
                      value={form.localization.defaultLanguage}
                    />
                    <ReadOnlyRow
                      label="Default Currency"
                      value={form.localization.defaultCurrency}
                    />
                    <ReadOnlyRow
                      label="Date Format"
                      value={form.localization.dateFormat}
                    />
                    <ReadOnlyRow
                      label="Distance Unit"
                      value={form.localization.distanceUnit}
                    />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section
                id="sec-payment"
                className="bg-white border rounded-2xl p-5 scroll-mt-6"
              >
                <h2 className="text-lg font-bold text-[#0d3778]">
                  Payment Settings
                </h2>

                <div className="mt-4 border rounded-2xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyRow
                      label="Platform Commission Rate (%)"
                      value={String(form.payment.platformCommissionRate)}
                    />
                    <ReadOnlyRow
                      label="Minimum Booking Amount (LKR)"
                      value={String(form.payment.minBookingAmount)}
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-bold text-[#0D3778] mb-3">
                      Accepted Payment Methods
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.payment.acceptedPaymentMethods.map((method) => (
                        <ReadOnlyChip key={method} text={method} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-10" />
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ReadOnlyRow({ label, value }) {
  const paragraphs = value.split("\n");

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <div className="w-full px-3 py-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-700">
        {paragraphs.map((text, i) => (
          <p key={i} className="mb-2 last:mb-0">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}

function ReadOnlyChip({ text }) {
  return (
    <div className="border rounded-2xl p-4 flex items-center gap-3 bg-slate-50">
      <span className="text-sm font-semibold text-slate-700">{text}</span>
    </div>
  );
}

function ToggleRow({ title, subtitle, checked, onChange }) {
  return (
    <div className="border rounded-2xl p-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
