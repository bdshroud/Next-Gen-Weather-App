import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import Loader from "../components/Loader";
import LocationModal from "../components/LocationModal";
import RecommandationCard from "../components/RecommandationCard";
import WeatherCard from "../components/WeatherCard";
import WeatherType from "../components/WeatherType";
import { getWeather } from "../services/get-weather";
import { getRecommandations } from "../utils/getRecommandation";

const Weather = () => {
  const value = useLocation();
  const place = value.state?.location;
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!place) {
      return;
    }
    const fetchWeather = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const result = await getWeather(place);
        setWeather(result);
      } catch (error) {
        setFetchError(error?.message || "Failed to load weather data");
      } finally {
        setLoading(false);
        setOpen(false);
      }
    };

    fetchWeather();
  }, [place]);

  if (!place) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <header className="pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              className="inline-flex items-center text-sm font-medium border border-slate-600 hover:border-slate-400 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-colors rounded-full px-4 py-1.5 shadow-sm"
              to={"/"}
            >
              ← Back To Home
            </Link>
          </div>
          <div>
            <h1 className="text-xl text-blue-300 font-bold">
              NextLevel <span className="text-blue-400">Weather</span>
            </h1>
          </div>
          <div>
            <button
              onClick={() => setOpen(true)}
              className="text-sm font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full cursor-pointer text-white shadow-sm"
              type="button"
            >
              Change location
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <Loader />
      ) : fetchError ? (
        <div className="bg-red-950/40 border border-red-800 rounded-2xl p-8 text-center text-red-200 max-w-lg mx-auto shadow-xl">
          <p className="text-lg font-semibold mb-2">Unable to load weather data</p>
          <p className="text-sm text-red-300 mb-6">{fetchError}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Try Another Location
            </button>
          </div>
        </div>
      ) : weather ? (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* Weather Card */}
            <WeatherCard place={place} weather={weather} />

            {/* Weather Recommendation */}
            <RecommandationCard recommendation={getRecommandations(weather)} />
          </div>

          {/* Weather Type / Scene */}
          <WeatherType place={place} weather={weather} />
        </div>
      ) : null}

      {open && <LocationModal onClose={() => setOpen(false)} />}
    </div>
  );
};

export default Weather;
