{
  properties.map((prop) => {
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
        onClick={() => setViewingId(prop.id)} // Yahan card click par detail view open hoga
        className={`rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group cursor-pointer ${isInactive ? "bg-rose-100/70 shadow-md opacity-90" : "bg-white border-gray-200 shadow-sm hover:shadow-xl"}`}
      >
        <div>
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={prop.title}
                className="w-full h-full object-cover transition duration-500"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
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
            <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-coral-600 transition leading-snug line-clamp-1">
              {prop.title}
            </h3>
            <p className="text-xs text-gray-500">{prop.city}</p>
          </div>
        </div>

        {/* Buttons par e.stopPropagation() lagana zaroori hai */}
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
              className={`p-2 border rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center ${isInactive ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"}`}
            >
              {isInactive ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>
    );
  });
}
