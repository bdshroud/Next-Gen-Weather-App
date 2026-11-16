import { useState } from "react";
import LocationModal from "../components/LocationModal";

const Home = () => {
  const [click, setClick] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto text-center px-4">
      <div>
        <h1 className="text-5xl sm:text-6xl text-blue-300 font-extrabold tracking-tight">
          NextLevel <span className="text-blue-400">Weather</span>
        </h1>
        <p className="py-4 text-base sm:text-lg text-gray-300 font-normal">
          Check real-time weather and smart suggestions for any location
        </p>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setClick(true)}
          className="text-base sm:text-lg font-medium hover:scale-105 transition-transform duration-200 bg-blue-600 hover:bg-blue-700 px-7 py-3 cursor-pointer rounded-full text-white shadow-lg shadow-blue-500/25"
        >
          Check Weather
        </button>
      </div>
      {click && <LocationModal onClose={() => setClick(false)} />}
    </div>
  );
};

export default Home;
