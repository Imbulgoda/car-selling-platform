import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "../layouts/Layout";
import api from "../services/api";

const EditVehicle = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";

    const [formData, setFormData] = useState({
        title: "",
        model: "",
        vehicleType: "",
        year: "",
        fuelType: "",
        description: "",
        numberPlate: "",
        km: "",
        seats: "",
        pricePerDay: "",
        pricePerKm: "",
        transmission: "",
        address: "",
        photos: []
    });

    const [existingPhotos, setExistingPhotos] = useState([]);
    const [originalPhotoCount, setOriginalPhotoCount] = useState(0);
    const [replacePhotos, setReplacePhotos] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [photoPreview, setPhotoPreview] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState({
        lat: 6.9271,
        lng: 80.7789,
        address: ""
    });

    // Fetch vehicle data on mount
    useEffect(() => {
        fetchVehicleData();
    }, [id]);

    const fetchVehicleData = async () => {
        try {
            setFetchingData(true);
            const response = await api.get(`/vehicle/get/${id}`);

            if (response.data.success) {
                const vehicle = response.data.vehicle;

                setFormData({
                    title: vehicle.title || "",
                    model: vehicle.model || "",
                    vehicleType: vehicle.vehicleType || "",
                    year: vehicle.year || "",
                    fuelType: vehicle.fuelType || "",
                    description: vehicle.description || "",
                    numberPlate: vehicle.numberPlate || "",
                    km: vehicle.km || "",
                    seats: vehicle.seats || "",
                    pricePerDay: vehicle.pricePerDay || "",
                    pricePerKm: vehicle.pricePerKm || "",
                    transmission: vehicle.transmission || "",
                    address: vehicle.location?.address || "",
                    photos: []
                });

                setExistingPhotos(vehicle.photos || []);
                setOriginalPhotoCount((vehicle.photos || []).length);

                // Set location from vehicle data
                if (vehicle.location?.geo?.coordinates) {
                    const [lng, lat] = vehicle.location.geo.coordinates;
                    setSelectedLocation({
                        lat: lat,
                        lng: lng,
                        address: vehicle.location.address || ""
                    });
                }
            } else {
                toast.error("Failed to fetch vehicle data");
                navigate("/owner/vehicles");
            }
        } catch (error) {
            console.error("Error fetching vehicle:", error);
            toast.error(error.response?.data?.message || "Error loading vehicle data");
            navigate("/owner/vehicles");
        } finally {
            setFetchingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            toast.error("Maximum 10 photos allowed");
            return;
        }
        setFormData({ ...formData, photos: files });
        previews(files);
    };

    const previews = (files) => {
        const previews = files.map((file) => URL.createObjectURL(file));
        setPhotoPreview(previews);
    };

    const handleRemoveExistingPhoto = (index) => {
        const updatedPhotos = existingPhotos.filter((_, i) => i !== index);
        setExistingPhotos(updatedPhotos);

        // If any photos are removed, auto-enable replace mode
        if (updatedPhotos.length < originalPhotoCount) {
            setReplacePhotos(true);
            toast.info("Replace mode enabled: New photos will replace all existing photos");
        }
    };

    // Initialize map
    useEffect(() => {
        if (showMap && mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([selectedLocation.lat, selectedLocation.lng], 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Add marker at selected location
            markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
                draggable: true,
            }).addTo(map);

            // Handle map click
            map.on("click", (e) => handleMapClick(e.latlng));

            // Handle marker drag
            markerRef.current.on("dragend", () => {
                const { lat, lng } = markerRef.current.getLatLng();
                updateLocationFromCoordinates(lat, lng);
            });

            mapInstanceRef.current = map;
        }

        return () => {
            // Cleanup on unmount
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off();
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [showMap]);

    const handleMapClick = (latlng) => {
        const { lat, lng } = latlng;
        updateLocationFromCoordinates(lat, lng);
    };

    const updateLocationFromCoordinates = async (lat, lng) => {
        try {
            // Update marker position
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            }

            // Reverse geocoding using Nominatim (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const address = data.address?.city || data.address?.town || data.display_name || "";

            setSelectedLocation({
                lat: parseFloat(lat.toFixed(6)),
                lng: parseFloat(lng.toFixed(6)),
                address: address,
            });

            setFormData((prev) => ({
                ...prev,
                address: address,
            }));
        } catch (error) {
            console.error("Error getting address:", error);
            toast.error("Could not fetch address details");
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                updateLocationFromCoordinates(latitude, longitude);
            });
        } else {
            toast.error("Geolocation not supported");
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 10) {
            toast.error("Maximum 10 photos allowed");
            return;
        }
        setFormData({ ...formData, photos: files });
        previews(files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title || !formData.model || !formData.vehicleType || !formData.year || !formData.fuelType ||
            !formData.numberPlate || !formData.km || !formData.seats || !formData.pricePerDay || !formData.pricePerKm ||
            !formData.transmission || !formData.address) {
            toast.error("Please fill all required fields");
            return;
        }

        // Check if there are photos (either existing or new)
        if (replacePhotos) {
            // In replace mode, must have new photos
            if (formData.photos.length === 0) {
                toast.error("Please upload new photos to replace existing ones");
                return;
            }
        } else {
            // In append mode, must have at least existing photos OR new photos
            if (existingPhotos.length === 0 && formData.photos.length === 0) {
                toast.error("Please keep at least 1 photo or upload new photos");
                return;
            }
        }

        submitForm();
    };

    const submitForm = async () => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("model", formData.model);
            formDataToSend.append("vehicleType", formData.vehicleType);
            formDataToSend.append("year", formData.year);
            formDataToSend.append("fuelType", formData.fuelType);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("numberPlate", formData.numberPlate);
            formDataToSend.append("km", formData.km);
            formDataToSend.append("seats", formData.seats);
            formDataToSend.append("pricePerDay", formData.pricePerDay);
            formDataToSend.append("pricePerKm", formData.pricePerKm);
            formDataToSend.append("transmission", formData.transmission);
            formDataToSend.append("address", formData.address);
            formDataToSend.append("lat", selectedLocation.lat);
            formDataToSend.append("lng", selectedLocation.lng);
            formDataToSend.append("replacePhotos", replacePhotos.toString());

            for (let photo of formData.photos) {
                formDataToSend.append("photos", photo);
            }

            const response = await fetch(`${API_BASE_URL}/api/v1/vehicle/update/${id}`, {
                method: "PUT",
                body: formDataToSend,
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update vehicle");
            }

            toast.success("Vehicle updated successfully!");
            setTimeout(() => {
                navigate("/owner/vehicles");
            }, 1500);
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.message || "Failed to update vehicle");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading vehicle data...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: "#F5F5F5" }}>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg p-6 md:p-10" style={{ border: "3px solid #0D3778" }}>
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "#0D3778" }}>
                                Edit Vehicle Details
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Update your vehicle information and manage your listing
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Vehicle Title */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                    Vehicle Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    readOnly
                                    className="w-full border-2 rounded-md px-3 py-2.5 text-gray-600 bg-gray-100 cursor-not-allowed"
                                    style={{ borderColor: "#D1D5DB" }}
                                    placeholder="e.g., Toyota Camry 2020 - Automatic"
                                />
                            </div>

                            {/* Vehicle Model & Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Vehicle Model <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        readOnly
                                        className="w-full border-2 rounded-md px-3 py-2.5 text-gray-600 bg-gray-100 cursor-not-allowed"
                                        style={{ borderColor: "#D1D5DB" }}
                                        placeholder="e.g., Toyota"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Vehicle Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="vehicleType"
                                        value={formData.vehicleType}
                                        disabled
                                        className="w-full border-2 rounded-md px-3 py-2.5 text-gray-600 bg-gray-100 cursor-not-allowed"
                                        style={{ borderColor: "#D1D5DB" }}
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        <option value="Car">Car</option>
                                        <option value="Van">Van</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Pickup">Pickup</option>
                                        <option value="Bus">Bus</option>
                                        <option value="Bike">Bike</option>
                                        <option value="ThreeWheel">ThreeWheel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Year & Fuel Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                                        style={{ borderColor: "#0D3778" }}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Fuel Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="fuelType"
                                        value={formData.fuelType}
                                        onChange={handleChange}
                                        className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                                        style={{ borderColor: "#0D3778" }}
                                        required
                                    >
                                        <option value="">Select Fuel Type</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 resize-none"
                                    style={{ borderColor: "#0D3778" }}
                                    placeholder="Describe features, condition, mileage, special amenities..."
                                    rows="4"
                                />
                            </div>

                            {/* Number Plate, KM & Seats - Horizontal Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Number Plate <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="numberPlate"
                                        value={formData.numberPlate}
                                        readOnly
                                        className="w-full border-2 rounded-md px-3 py-2.5 text-gray-600 bg-gray-100 cursor-not-allowed"
                                        style={{ borderColor: "#D1D5DB" }}
                                        placeholder="WP/AB 1234"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        KM <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="km"
                                        value={formData.km}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                                        style={{ borderColor: "#0D3778" }}
                                        placeholder="50000"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Seat Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="seats"
                                        value={formData.seats}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                                        style={{ borderColor: "#0D3778" }}
                                        placeholder="e.g., 5"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Rental Amount */}
                            <div>
                                <label className="block text-sm font-semibold mb-3" style={{ color: "#0D3778" }}>
                                    Rental Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2">Daily Rental Rate</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="pricePerDay"
                                                value={formData.pricePerDay}
                                                onChange={handleChange}
                                                className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                                                style={{ borderColor: "#0D3778" }}
                                                placeholder="Daily Rental Rate"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RS.100</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-2">Per Kilometer Charge</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="pricePerKm"
                                                value={formData.pricePerKm}
                                                onChange={handleChange}
                                                className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                                                style={{ borderColor: "#0D3778" }}
                                                placeholder="Per Kilometer Charge"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RS.100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transmission & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Transmission <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="transmission"
                                        value={formData.transmission}
                                        onChange={handleChange}
                                        className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                                        style={{ borderColor: "#0D3778" }}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="flex-1 border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                                            style={{ borderColor: "#0D3778" }}
                                            placeholder="Selected location will appear here"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowMap(!showMap)}
                                            className="px-4 py-2 rounded-md font-semibold text-white hover:opacity-90 transition-all flex items-center justify-center"
                                            style={{ backgroundColor: "#0D3778" }}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Map Modal */}
                            {showMap && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
                                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                                            <h3 className="text-lg font-semibold" style={{ color: "#0D3778" }}>
                                                Select Location on Map
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowMap(false)}
                                                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-all flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    Use My Current Location
                                                </button>
                                                <div className="flex-1 text-sm text-gray-600">
                                                    <p>Selected: <strong>{selectedLocation.address || "Click on map to select"}</strong></p>
                                                    <p>Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}</p>
                                                </div>
                                            </div>

                                            <div
                                                ref={mapRef}
                                                style={{
                                                    height: "400px",
                                                    width: "100%",
                                                    borderRadius: "8px",
                                                    border: "2px solid #0D3778"
                                                }}
                                            />

                                            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-gray-700 flex items-start gap-2">
                                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#0D3778" }} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                                </svg>
                                                <div><strong>Tips:</strong> Click on the map to place a marker, drag the marker to adjust location, or use the button above to set your current location.</div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowMap(false)}
                                                className="w-full mt-4 px-4 py-2 rounded-md font-semibold text-white hover:opacity-90 transition-all"
                                                style={{ backgroundColor: "#0D3778" }}
                                            >
                                                Confirm Location
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Photos */}
                            <div>
                                <label className="block text-sm font-semibold mb-3" style={{ color: "#0D3778" }}>
                                    Vehicle Photos
                                </label>

                                {/* Existing Photos */}
                                {existingPhotos.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#0D3778" }}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            Current Photos: {existingPhotos.length}
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {existingPhotos.map((photo, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={`${API_BASE_URL}${photo.url}`}
                                                        alt={`existing-${index}`}
                                                        className="w-full h-24 object-cover rounded border-2 border-gray-200"
                                                        onError={(e) => {
                                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%236b7280'%3EImage%3C/text%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExistingPhoto(index)}
                                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Replace Photos Checkbox */}
                                <div className="mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={replacePhotos}
                                            onChange={(e) => setReplacePhotos(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300"
                                            style={{ accentColor: "#0D3778" }}
                                            disabled={existingPhotos.length < originalPhotoCount}
                                        />
                                        <span className="text-sm text-gray-700">
                                            Replace all existing photos with new uploads
                                        </span>
                                    </label>
                                    {replacePhotos && (
                                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div className="text-sm text-yellow-800">
                                                <strong>Replace Mode Active:</strong> All current photos will be removed and replaced with your new uploads when you save.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Photo Upload */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300"
                                    style={{
                                        borderColor: dragActive ? "#0D3778" : "#CBD5E0",
                                        backgroundColor: dragActive ? "#F0F4FF" : "#FAFAFA"
                                    }}
                                >
                                    <input
                                        type="file"
                                        name="photos"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="photoInput"
                                        multiple
                                        accept="image/jpeg, image/png"
                                    />
                                    <label htmlFor="photoInput" className="cursor-pointer">
                                        <div className="mb-3">
                                            <svg className="w-14 h-14 mx-auto" style={{ color: "#0D3778" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium mb-1">Drag and drop photos here, or click to select</p>
                                        <p className="text-red-400 text-xs">Support: JPEG, PNG (Max 10 MB each, max 10 photos)</p>
                                    </label>
                                </div>

                                {/* New Photo Preview */}
                                {photoPreview.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#0D3778" }}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            New Photos Selected: {photoPreview.length}
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {photoPreview.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`preview-${index}`}
                                                        className="w-full h-24 object-cover rounded border-2 border-gray-200"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate("/owner/vehicles")}
                                    className="px-6 py-3 bg-white border-2 rounded-lg font-semibold transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                                    style={{ borderColor: "#0D3778", color: "#0D3778" }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 text-white rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ backgroundColor: "#0D3778" }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Vehicle
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EditVehicle;
