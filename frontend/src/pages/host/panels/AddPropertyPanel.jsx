import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChevronDown, CheckSquare, Square, Plus, X, Send } from "lucide-react";

function AddPropertyPanel({ onBack, onAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    city: "",
    address: "",
    pricePerNight: "",
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
  });

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  const propertyTypeRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        propertyTypeRef.current &&
        !propertyTypeRef.current.contains(event.target)
      )
        setIsPropertyTypeOpen(false);
      if (cityRef.current && !cityRef.current.contains(event.target))
        setIsCityOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const propertyTypes = ["Apartment", "Villa", "House", "Studio", "Penthouse"];
  const citiesList = ["Islamabad", "Lahore", "Karachi", "Rawalpindi", "Murree"];
  const amenitiesList = [
    "Wi-Fi",
    "Air Conditioning",
    "Kitchen",
    "Parking",
    "Washing Machine",
    "TV",
    "Swimming Pool",
    "Heating",
    "Garden",
  ];

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.propertyType || !formData.city) {
      alert("Barah-e-karam Property Type aur City select karein!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token nahi mila. Please login again.");
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("property_type", formData.propertyType);
      data.append("city", formData.city);
      data.append("address", formData.address);
      data.append("price_per_night", Number(formData.pricePerNight));
      data.append("max_guests", Number(formData.maxGuests));
      data.append("bedrooms", Number(formData.bedrooms));
      data.append("beds", Number(formData.beds));
      data.append("bathrooms", Number(formData.bathrooms));

      // Amenities ko JSON string ban kar bhejna
      data.append("amenities", JSON.stringify(selectedAmenities));

      // Photos files append karna
      photos.forEach((photo) => {
        data.append("photos", photo);
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/properties/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type Axios khud multipart/form-data set kar lega boundary ke sath
          },
        },
      );

      alert("Property published successfully!");
      if (onAdded) onAdded();
    } catch (err) {
      console.error("Error publishing property:", err);
      alert(err.response?.data?.detail || "Failed to publish property");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Add New Property
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Publish your space to list it for guests and hosts.
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer w-fit"
          >
            ← Back to Properties
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Property title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Luxury Apartment with Mountain View"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="4"
                required
                placeholder="Describe your place..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-medium focus:outline-none focus:border-coral-500 transition resize-none"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={propertyTypeRef}>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Property type
                </label>
                <div
                  onClick={() => {
                    setIsPropertyTypeOpen(!isPropertyTypeOpen);
                    setIsCityOpen(false);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs flex items-center justify-between cursor-pointer select-none transition hover:border-gray-300"
                >
                  <span className="font-bold text-gray-950">
                    {formData.propertyType || "Select property type"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${isPropertyTypeOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isPropertyTypeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2">
                    {propertyTypes.map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          setFormData({ ...formData, propertyType: type });
                          setIsPropertyTypeOpen(false);
                        }}
                        className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition ${formData.propertyType === type ? "bg-coral-50 text-coral-600" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={cityRef}>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  City
                </label>
                <div
                  onClick={() => {
                    setIsCityOpen(!isCityOpen);
                    setIsPropertyTypeOpen(false);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs flex items-center justify-between cursor-pointer select-none transition hover:border-gray-300"
                >
                  <span className="font-bold text-gray-950">
                    {formData.city || "Select city"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${isCityOpen ? "rotate-180" : ""}`}
                  />
                </div>
                {isCityOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2">
                    {citiesList.map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setFormData({ ...formData, city: c });
                          setIsCityOpen(false);
                        }}
                        className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition ${formData.city === c ? "bg-coral-50 text-coral-600" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                required
                placeholder="Street address or neighborhood"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Pricing & Capacity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Price per night (Rs.)
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 5000"
                value={formData.pricePerNight}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerNight: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Maximum guests
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxGuests}
                onChange={(e) =>
                  setFormData({ ...formData, maxGuests: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Beds
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.beds}
                onChange={(e) =>
                  setFormData({ ...formData, beds: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Amenities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {amenitiesList.map((item) => {
              const isChecked = selectedAmenities.includes(item);
              return (
                <div
                  key={item}
                  onClick={() => toggleAmenity(item)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition ${isChecked ? "border-coral-500 bg-coral-50/40 text-gray-900" : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"}`}
                >
                  {isChecked ? (
                    <CheckSquare
                      size={18}
                      className="text-coral-500 shrink-0"
                    />
                  ) : (
                    <Square size={18} className="text-gray-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Photos
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Upload pictures of your space.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative w-48 aspect-video rounded-2xl overflow-hidden border border-gray-200 group shadow-xs shrink-0"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Property preview"
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full z-10">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPhotos(photos.filter((_, i) => i !== index))
                  }
                  className="absolute top-2 right-2 w-6 h-6 bg-gray-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition opacity-90 hover:opacity-100 shadow-md cursor-pointer z-20"
                  title="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="w-48 aspect-video rounded-2xl border-2 border-dashed border-gray-300 hover:border-coral-500 bg-gray-50 hover:bg-coral-50/20 flex flex-col items-center justify-center cursor-pointer transition gap-1.5 text-gray-500 hover:text-coral-600 shrink-0">
              <Plus size={20} />
              <span className="text-xs font-bold">Add photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0])
                    setPhotos([...photos, e.target.files[0]]);
                }}
              />
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-coral-500/25 flex items-center gap-2"
          >
            <Send size={14} /> Publish Property
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPropertyPanel;
