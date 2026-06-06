import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById } from "../services/vehicleApi";

import DropdownCard from "../components/vehicle/DropdownCard";
import MiniCalendar from "../components/vehicle/MiniCalendar";
import { SimpleRow, BulletRow, LegendItem } from "../components/vehicle/Rows";

import {
  SettingsIcon,
  NotebookIcon,
  VehicleIcon,
  CalendarIcon,
  FuelStationIcon,
  WorldIcon,
} from "../components/vehicle/Icons";

import Layout from "../layouts/Layout";

import { getVehicleAvailability } from "../services/bookingApi";

// helpers
function toYYYYMM(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function addMonths(yyyyMm, diff) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y, m - 1 + diff, 1);
  return toYYYYMM(d);
}
function formatMonthLabel(yyyyMm) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [month, setMonth] = useState(toYYYYMM(new Date()));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);

  // dropdown states
  const [open, setOpen] = useState({
    registration: true,
    availability: true,
    rental: true,
    location: true,
    specs: true,
    description: true,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getVehicleById(id); // { success, vehicle }
        if (!mounted) return;
        console.log(data);
        setVehicle(data?.vehicle || null);
        setActiveImg(0);

        const avail = await getVehicleAvailability(id); // { success, data: bookings[] }
        if (!mounted) return;
        setBookings(avail?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.message || e.message || "Failed to load vehicle.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // IMPORTANT: build correct image URLs (photos[].url is relative)
  const photoUrls = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
    const photos = vehicle?.photos || [];

    return photos
      .map((p) => {
        if (!p?.url) return null;

        let u = p.url;

        // fix old db urls like "./uploads/..."
        u = u.replace("./uploads", "/uploads");

        // keep full urls
        if (u.startsWith("http")) return u;

        // ensure leading slash
        if (!u.startsWith("/")) u = "/" + u;

        return `${base}${u}`;
      })
      .filter(Boolean);
  }, [vehicle]);

  const titleText =
    vehicle?.title || `${vehicle?.model || ""} ${vehicle?.year || ""}`.trim();

  const specItems = [
    { label: "Type", value: vehicle?.vehicleType || "—" },
    { label: "Model", value: vehicle?.model || "—" },
    { label: "Year", value: vehicle?.year ?? "—" },
    { label: "Transmission", value: vehicle?.transmission || "—" },
    { label: "Fuel Type", value: vehicle?.fuelType || "—" },
  ];

  // MiniCalendar will use this to mark blocked days
  const blockedSet = useMemo(() => {
    const s = new Set();

    (bookings || []).forEach((b) => {
      const start = new Date(b.startingDate);
      const end = new Date(b.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      // block each day in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        s.add(d.toISOString().slice(0, 10)); // YYYY-MM-DD
      }
    });

    return s;
  }, [bookings]);

  // OPTIONAL: month-specific bookings count (small info)
  const blockedCountInMonth = useMemo(() => {
    const prefix = `${month}-`; // e.g. "2026-01-"
    let c = 0;
    blockedSet.forEach((d) => {
      if (d.startsWith(prefix)) c += 1;
    });
    return c;
  }, [blockedSet, month]);

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-10 py-6 font-nunito">
        <div className="text-slate-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-10 py-6 font-nunito">
        <div className="border-2 border-red-500 rounded-2xl p-4">
          <h2 className="font-bold text-lg">Couldn’t load vehicle</h2>
          <p className="text-slate-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-10 py-6 font-nunito">
        <div className="text-slate-700">Vehicle not found.</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="w-full px-3 sm:px-6 lg:px-10 py-6 font-nunito bg-white">
        {/* Title */}
        <h1 className="text-[24px] font-bold text-[#0d3778] mb-4">
          {titleText}
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_0.95fr] gap-5 items-start">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Gallery */}
            <div className="border-2 border-[#0d3778] rounded-2xl p-3 bg-white shadow-sm">
              <div className="rounded-xl overflow-hidden bg-slate-100 h-[220px] sm:h-[300px] lg:h-[340px] flex items-center justify-center">
                {photoUrls[activeImg] ? (
                  <img
                    src={photoUrls[activeImg]}
                    alt="Vehicle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 text-sm">No image</div>
                )}
              </div>

              {/* dots */}
              <div className="flex justify-center gap-2 my-3">
                {photoUrls.slice(0, 6).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`w-2 h-2 rounded-full ${
                      idx === activeImg ? "bg-[#0d3778]" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              {/* thumbs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photoUrls.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`h-[62px] sm:h-[72px] rounded-xl overflow-hidden border-2 border-[#0d3778] bg-white ${
                      idx === activeImg ? "ring-4 ring-[#0d3778]/20" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

                {photoUrls.length < 4 &&
                  Array.from({ length: 4 - photoUrls.length }).map((_, i) => (
                    <div
                      key={`ph-${i}`}
                      className="h-[62px] sm:h-[72px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
                    />
                  ))}
              </div>
            </div>

            {/* Specs */}
            <DropdownCard
              title="Vehicle Specification"
              icon={<SettingsIcon />}
              open={open.specs}
              onToggle={() => setOpen((p) => ({ ...p, specs: !p.specs }))}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
                {specItems.map((it) => (
                  <BulletRow key={it.label} label={it.label} value={it.value} />
                ))}
              </div>
            </DropdownCard>

            {/* Description */}
            <DropdownCard
              title="Description"
              icon={<NotebookIcon />}
              open={open.description}
              onToggle={() =>
                setOpen((p) => ({ ...p, description: !p.description }))
              }
            >
              <p className="text-[14px] text-slate-700 leading-relaxed">
                {vehicle?.description || "—"}
              </p>
            </DropdownCard>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Registration */}
            <DropdownCard
              title="Registration"
              icon={<VehicleIcon />}
              open={open.registration}
              onToggle={() =>
                setOpen((p) => ({ ...p, registration: !p.registration }))
              }
            >
              <div className="space-y-2">
                <SimpleRow
                  label="Number Plate"
                  value={vehicle?.numberPlate || "—"}
                />
              </div>
            </DropdownCard>

            {/* Availability (dummy UI only) */}
            <DropdownCard
              title="Availability"
              icon={<CalendarIcon />}
              open={open.availability}
              onToggle={() =>
                setOpen((p) => ({ ...p, availability: !p.availability }))
              }
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  className="w-9 h-9 rounded-full border-2 border-[#0d3778] text-[#0d3778] font-bold"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                >
                  ‹
                </button>

                <div className="text-[#0d3778] font-semibold text-[14px]">
                  {formatMonthLabel(month)}
                </div>

                <button
                  className="w-9 h-9 rounded-full border-2 border-[#0d3778] text-[#0d3778] font-bold"
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                >
                  ›
                </button>
              </div>

              {/* ✅ NEW: pass blockedSet to calendar */}
              <MiniCalendar month={month} blockedSet={blockedSet} />

              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-4 items-center text-[12px] text-slate-700">
                  <LegendItem
                    color="bg-emerald-100 border-emerald-300"
                    label="Available"
                  />
                  <LegendItem
                    color="bg-red-100 border-red-300"
                    label="Blocked"
                  />
                </div>

                {/* small info */}
                <div className="text-[12px] text-slate-500">
                  Blocked days: {blockedCountInMonth}
                </div>
              </div>
            </DropdownCard>

            {/* Rental */}
            <DropdownCard
              title="Rental"
              icon={<FuelStationIcon />}
              open={open.rental}
              onToggle={() => setOpen((p) => ({ ...p, rental: !p.rental }))}
            >
              <div className="space-y-2">
                <SimpleRow
                  label="Price Per Day"
                  value={vehicle?.pricePerDay ?? "—"}
                />
                <SimpleRow
                  label="Price Per Km"
                  value={vehicle?.pricePerKm ?? "—"}
                />
              </div>
            </DropdownCard>

            {/* Location */}
            <DropdownCard
              title="Location"
              icon={<WorldIcon />}
              open={open.location}
              onToggle={() => setOpen((p) => ({ ...p, location: !p.location }))}
            >
              <div className="space-y-2">
                <SimpleRow
                  label="Available in"
                  value={vehicle?.location?.address || "—"}
                />
              </div>
            </DropdownCard>

            {/* Book Now */}
            <div className="flex justify-stretch">
              <button
                className="w-full h-[48px] rounded-xl bg-[#0d3778] text-white font-semibold text-[14px] hover:opacity-95"
                onClick={() =>
                  navigate("/booking", { state: { vehicleId: id } })
                }
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
