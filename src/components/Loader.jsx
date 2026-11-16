import WeatherLottie from "./WeatherLottie";

const Loader = () => {
  return (
    <div className="flex justify-center my-12">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl backdrop-blur-sm">
        <WeatherLottie kind="weather" name="cloudy" className="w-[110px] h-[110px] mx-auto" />
        <p className="text-base font-semibold text-slate-300 mt-3 mb-0">Getting your weather...</p>
      </div>
    </div>
  );
};

export default Loader;