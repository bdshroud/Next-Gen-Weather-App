import { Droplet, MapPin, Thermometer, Wind } from "lucide-react";
import { getWeatherTheme } from "../utils/getTheme";

export default function WeatherCard({ place, weather }) {
  const theme = getWeatherTheme(weather?.icon);

  const stats = [
    { icon: Thermometer, label: "Feels like", value: weather ? `${weather.feelsLike}°C` : "--" },
    { icon: Droplet, label: "Humidity", value: weather ? `${weather.humidity}%` : "--" },
    { icon: Wind, label: "Wind speed", value: weather ? `${weather.windSpeed} km/h` : "--" },
  ];

  return (
    <section className="bg-white text-gray-800 rounded-2xl shadow-xl relative overflow-hidden p-8 max-[480px]:p-6 border border-gray-100">
      {/* A hint of the weather colour in the corner of the white card. */}
      <span
        className="absolute -top-24 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.accent, opacity: 0.16 }}
        aria-hidden="true"
      />

      <div className="relative">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
          Today's weather
        </span>

        <h2 className="flex items-center gap-2 text-[26px] max-[480px]:text-[22px] font-bold mt-4 mb-0 text-gray-900">
          <MapPin size={21} strokeWidth={2.5} className="text-blue-500 flex-shrink-0" />
          <span className="truncate">{place?.name || "Current Location"}</span>
        </h2>

        <div className="flex items-end gap-5 mt-6 mb-7 max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-2">
          <span
            className="text-[90px] max-[480px]:text-[72px] font-extrabold tracking-tight leading-[0.82]"
            style={{ color: theme.strong }}
          >
            {weather?.temperature ?? "--"}
            <span className="text-[48px] max-[480px]:text-[38px] align-top">°</span>
          </span>
          <div className="pb-2">
            <span className="block text-[20px] font-bold text-gray-900">{weather?.conditionLabel}</span>
            <span className="block text-[14px] text-gray-500">{weather?.description}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-[#f7fafe] border border-gray-200 rounded-[18px] px-4 py-[14px] transition-colors hover:bg-blue-50 hover:border-blue-200"
            >
              <span className="inline-flex items-center justify-center w-[34px] h-[34px] rounded-[11px] bg-blue-100 text-blue-600 flex-shrink-0">
                <Icon size={17} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <span className="block text-[11.5px] font-semibold text-gray-500">{label}</span>
                <span className="block text-[16px] font-bold text-gray-900 leading-tight">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}