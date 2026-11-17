import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  MapPin,
  Bed,
  Users,
  Star,
  Bath,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Send,
  ChevronDown,
  CheckSquare,
  Square,
  Plus,
  CheckCircle,
} from "lucide-react";

// 1. Property Detail Component (Guest style complete details view for Host)
function PropertyDetailPanel({ propertyId, onBack }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/properties/${propertyId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setProperty(response.data);
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchDetail();
  }, [propertyId]);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Loading property details...
      </div>
    );
  if (!property)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Property nahi mili.
      </div>
    );

  let amenitiesList = [];
  if (property.amenities) {
    amenitiesList =
      typeof property.amenities === "string"
        ? property.amenities.split(",").map((a) => a.trim())
        : property.amenities;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="bg-coral-50 text-coral-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {property.property_type || "Apartment"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-2">
            {property.title}
          </h1>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
            <MapPin size={14} className="text-coral-500" /> {property.address},{" "}
            {property.city}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          ← Back to Properties
        </button>
      </div>

      {/* Photos Grid Gallery */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
          Property Photos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {property.photos &&
            property.photos
              .replace(/[\[\]"]/g, "")
              .split(",")
              .map((img, idx) => {
                let imgUrl = img.trim();
                if (!imgUrl.startsWith("http")) {
                  imgUrl = `http://127.0.0.1:8000/${imgUrl.replace(/^\/+/, "")}`;
                }
                return (
                  <div
                    key={idx}
                    className="aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                  >
                    <img
                      src={imgUrl}
                      alt="Property view"
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
        </div>
      </div>

      {/* Main Details & Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              About this space
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed font-medium whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {amenitiesList.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenitiesList.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100"
                  >
                    <CheckCircle
                      size={14}
                      className="text-coral-500 shrink-0"
                    />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5 h-fit">
            <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Price per night
              </span>
              <span className="text-lg font-black text-gray-950">
                Rs. {Number(property.price_per_night).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <Bed size={15} className="text-gray-400" /> Bedrooms
                </span>
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <Bed size={15} className="text-gray-400" /> Beds
                </span>
                <span>{property.beds}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <Bath size={15} className="text-gray-400" /> Bathrooms
                </span>
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <Users size={15} className="text-gray-400" /> Max Guests
                </span>
                <span>{property.max_guests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Edit Property Panel Component
function EditPropertyPanel({ propertyId, onBack, onUpdated, showPopup }) {
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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/properties/${propertyId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const prop = response.data;
        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          propertyType: prop.property_type || "",
          city: prop.city || "",
          address: prop.address || "",
          pricePerNight: prop.price_per_night || "",
          maxGuests: prop.max_guests || 2,
          bedrooms: prop.bedrooms || 1,
          beds: prop.beds || 1,
          bathrooms: prop.bathrooms || 1,
        });
        if (prop.amenities) {
          const amList =
            typeof prop.amenities === "string"
              ? prop.amenities.split(",").map((a) => a.trim())
              : prop.amenities;
          setSelectedAmenities(amList);
        }
        if (prop.photos) {
          const photoList =
            typeof prop.photos === "string"
              ? prop.photos
                  .replace(/[\[\]"]/g, "")
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0)
              : prop.photos;
          setPhotos(photoList);
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        alert("Property data load karne mein masla hoa.");
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchPropertyDetails();
  }, [propertyId]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.propertyType || !formData.city) {
      alert("Barah-e-karam Property Type aur City select karein!");
      return;
    }
    const token = localStorage.getItem("token");
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

      data.append("amenities", JSON.stringify(selectedAmenities));

      const existingPhotoUrls = photos.filter((p) => typeof p === "string");
      data.append("existing_photos", JSON.stringify(existingPhotoUrls));

      photos.forEach((photo) => {
        if (typeof photo !== "string") {
          data.append("photos", photo);
        }
      });

      await axios.put(
        `http://127.0.0.1:8000/api/v1/properties/${propertyId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      showPopup("Property successfully updated!");
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Error updating property:", err);
      alert(err.response?.data?.detail || "Failed to update property");
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Loading property details...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-950">Edit Property</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Update your property details and pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          ← Back to Properties
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="font-bold text-gray-950">
                    {formData.propertyType || "Select type"}
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs flex items-center justify-between cursor-pointer select-none"
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
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-coral-500 transition"
              />
            </div>
          </div>
        </div>

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

        {/* Amenities Section */}
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
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    isChecked
                      ? "border-coral-500 bg-coral-50/40 text-gray-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                  }`}
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

        {/* Photos Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Photos
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage and upload pictures of your space.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {photos.map((photo, index) => {
              let preview = "";
              if (typeof photo === "string") {
                if (photo.startsWith("http://") || photo.startsWith("https://"))
                  preview = photo;
                else
                  preview = `http://127.0.0.1:8000/${photo.replace(/^\/+/, "")}`;
              } else {
                preview = URL.createObjectURL(photo);
              }
              return (
                <div
                  key={index}
                  className="relative w-48 aspect-video rounded-2xl overflow-hidden border border-gray-200 group shadow-xs shrink-0"
                >
                  <img
                    src={preview}
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
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-900/80 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition cursor-pointer z-20"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
            <label className="w-48 aspect-video rounded-2xl border-2 border-dashed border-gray-300 hover:border-coral-500 bg-gray-50 hover:bg-coral-50/20 flex flex-col items-center justify-center cursor-pointer transition gap-1.5 text-gray-500 hover:text-coral-600 shrink-0">
              <Plus size={20} />
              <span className="text-xs font-bold">Add photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPhotos([...photos, e.target.files[0]]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-coral-500/25 flex items-center gap-2"
          >
            <Send size={14} /> Update Property
          </button>
        </div>
      </form>
    </div>
  );
}

// 3. Main HostPropertiesCardView Component
function HostPropertiesCardView({ onAddClick }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inactiveIds, setInactiveIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Popup State for top-middle notification
  const [popupMessage, setPopupMessage] = useState(null);

  const triggerPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => {
      setPopupMessage(null);
    }, 5000);
  };

  const fetchHostProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token nahi mila. Please login karein.");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/properties/my-properties",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProperties(response.data);

      // Database se aane wale inactive status ko state mein set karna
      const inactiveList = response.data
        .filter((p) => p.is_active === false)
        .map((p) => p.id);
      setInactiveIds(inactiveList);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Properties load karne mein masla aa gaya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostProperties();
  }, []);

  const handleEdit = (id) => setEditingId(id);
  const confirmDelete = (id) => {
    setPropertyToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/properties/${propertyToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProperties(properties.filter((prop) => prop.id !== propertyToDelete));
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
      triggerPopup("Property deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete property.");
    }
  };

  // Database mein status update karne ka function (Backend API call)
  const updatePropertyStatusInDB = async (id, newActiveStatus) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("is_active", newActiveStatus);

      await axios.put(
        `http://127.0.0.1:8000/api/v1/properties/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (newActiveStatus) {
        triggerPopup("Property is now Active!");
      } else {
        triggerPopup("Property is now Inactive!");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status in database.");
    }
  };

  const handleActive = (id) => {
    setInactiveIds(inactiveIds.filter((item) => item !== id));
    updatePropertyStatusInDB(id, true);
  };

  const handleInactive = (id) => {
    if (!inactiveIds.includes(id)) setInactiveIds([...inactiveIds, id]);
    updatePropertyStatusInDB(id, false);
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 font-medium">
        Loading properties...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-20 text-red-500 font-medium">{error}</p>
    );

  if (editingId) {
    return (
      <EditPropertyPanel
        propertyId={editingId}
        onBack={() => setEditingId(null)}
        onUpdated={() => {
          setEditingId(null);
          fetchHostProperties();
        }}
        showPopup={triggerPopup}
      />
    );
  }

  if (viewingId) {
    return (
      <PropertyDetailPanel
        propertyId={viewingId}
        onBack={() => setViewingId(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* TOP-MIDDLE LIGHT CORAL TOAST NOTIFICATION */}
      {popupMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-coral-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-coral-500 transition-all duration-300">
          <CheckCircle size={18} className="text-white shrink-0" />
          <span className="text-xs font-bold tracking-wide">
            {popupMessage}
          </span>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        My Published Properties
      </h2>

      {properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto my-10 space-y-4">
          <div className="text-5xl mb-2">🏠</div>
          <h3 className="text-lg font-bold text-gray-800">
            No Properties Published Yet
          </h3>
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <span>+ Add Property</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {properties.map((prop) => {
            let imageUrl = "";
            if (prop.photos) {
              const cleanedPhotos = prop.photos.replace(/[\[\]"]/g, "");
              let rawUrl = cleanedPhotos.split(",")[0].trim();
              if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
                imageUrl = rawUrl;
              else if (rawUrl)
                imageUrl = `http://127.0.0.1:8000/${rawUrl.replace(/^\/+/, "")}`;
            }
            const isInactive = inactiveIds.includes(prop.id);
            return (
              <div
                key={prop.id}
                onClick={() => setViewingId(prop.id)}
                className={`rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                  isInactive
                    ? "bg-rose-100/70 shadow-md opacity-90"
                    : "bg-white border-gray-200 shadow-sm hover:shadow-xl"
                }`}
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🏠
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-gray-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                      {prop.property_type || "Apartment"}
                    </span>
                    {isInactive && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 font-bold text-gray-700">
                        <MapPin size={12} className="text-coral-500" />{" "}
                        {prop.city}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-gray-900">
                        <Star
                          size={12}
                          className="text-amber-500 fill-amber-500"
                        />{" "}
                        4.9 (28)
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-coral-600 transition leading-snug line-clamp-1">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium pt-0.5">
                      <span className="flex items-center gap-1">
                        <Bed size={13} className="text-gray-400" /> {prop.beds}{" "}
                        Beds
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-gray-400" />{" "}
                        {prop.max_guests} Guests
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Bath size={13} className="text-gray-400" />{" "}
                        {prop.bathrooms} Baths
                      </span>
                    </div>
                    {prop.amenities && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {typeof prop.amenities === "string"
                          ? prop.amenities
                              .split(",")
                              .slice(0, 2)
                              .map((am, i) => (
                                <span
                                  key={i}
                                  className="bg-gray-100 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-lg"
                                >
                                  {am.trim()}
                                </span>
                              ))
                          : null}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="px-5 pb-5 pt-3 border-t border-gray-200/60 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                      Per Night Rent
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      Rs. {Number(prop.price_per_night).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(prop.id);
                      }}
                      title="Edit"
                      className="p-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-200 transition shadow-sm cursor-pointer flex items-center justify-center"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(prop.id);
                      }}
                      title="Delete"
                      className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition shadow-sm cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInactive) handleActive(prop.id);
                        else handleInactive(prop.id);
                      }}
                      title={isInactive ? "Set Active" : "Set Inactive"}
                      className={`p-2 border rounded-xl transition cursor-pointer flex items-center justify-center ${
                        isInactive
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      }`}
                    >
                      {isInactive ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full bg-gray-50 transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Property
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Are you sure you want to delete this property?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostPropertiesCardView;
