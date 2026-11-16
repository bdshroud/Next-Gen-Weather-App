import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getGeolocation } from "../services/get-geolocation";

const LocationModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goToPage = (location) => {
    navigate("/weather", { state: { location } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = city.trim();
    if (!value) {
      setError("Please enter a city name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const location = await getGeolocation(value);
      if (!location) {
        setError("Geocoding request failed!");
        return;
      }
      goToPage(location);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to find location");
    } finally {
      setLoading(false);
    }
  };

  const handleGeoLocations = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setError("");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (positions) => {
        const { latitude, longitude } = positions.coords;
        setLoading(false);
        goToPage({ name: "Current Location", lat: latitude, lon: longitude });
        onClose?.();
      },
      (err) => {
        setLoading(false);
        setError(err?.message || "Unable to retrieve your location");
      },
      {
        timeout: 10000,
      },
    );
  };

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex justify-center items-center bg-gray-950/70 p-4"
      onClick={onClose}
    >
      <div
        data-testid="modal-container"
        className="relative p-6 rounded-2xl w-full max-w-[420px] bg-white text-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Where are you today?</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              aria-label="City name"
              placeholder="Enter city name (e.g. London, Tokyo)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 bg-white text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="text-base w-full font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2.5 rounded-xl cursor-pointer text-white shadow"
              >
                {loading ? "Searching..." : "Get Weather"}
              </button>
            </div>
          </form>
        </div>

        <div className="py-3 text-center text-sm text-gray-500 font-medium">Or</div>

        <div>
          <button
            type="button"
            onClick={handleGeoLocations}
            disabled={loading}
            className="text-base w-full font-medium transition-all duration-200 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 px-5 py-2.5 rounded-xl cursor-pointer text-gray-800 border border-gray-300"
          >
            Use My Location
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
