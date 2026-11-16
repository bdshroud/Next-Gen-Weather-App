import { Thermometer } from "lucide-react";
import WeatherLottie from "./WeatherLottie";
import { getWeatherTheme } from "../utils/getTheme";

export default function WeatherType({ weather, place }) {
  const theme = getWeatherTheme(weather?.icon);

  const chipClass =
    "inline-flex items-center gap-2 text-[13px] font-semibold rounded-full px-[14px] py-2";

  return (
    <section
      className="relative overflow-hidden w-full rounded-2xl shadow-xl ring-1 ring-inset ring-white/40 px-7 py-8 max-[480px]:px-5 max-[480px]:py-6"
      style={{ background: theme.sky }}
    >
      <span
        className="absolute left-1/2 top-[42%] w-[360px] h-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.accent, opacity: 0.24 }}
        aria-hidden="true"
      />
      <span
        className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full bg-white opacity-40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 self-start text-xs font-semibold"
          style={{ background: theme.chip, color: theme.ink }}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Live in {place?.name || "Current Location"}
        </span>

        {weather?.icon && (
          <WeatherLottie
            kind="weather"
            name={weather.icon}
            className="my-1 w-[260px] h-[260px] max-[480px]:w-[180px] max-[480px]:h-[180px]"
          />
        )}

        <h3
          className="text-[30px] max-[480px]:text-[24px] font-bold leading-tight m-0"
          style={{ color: theme.ink }}
        >
          {weather?.conditionLabel}
        </h3>
        <p className="text-[15px] mt-1 mb-5 m-0 font-medium" style={{ color: theme.inkSoft }}>
          {weather?.description}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <span className={chipClass} style={{ background: theme.chip, color: theme.ink }}>
            <Thermometer size={15} strokeWidth={2.5} />
            Feels like {weather?.feelsLike ?? "--"}°C
          </span>
        </div>
      </div>
    </section>
  );
}