import { LottieLight } from "lottie-react";

export default function WeatherLottie({ kind, name, className = "" }) {
  if (!kind || !name) return null;
  return (
    <LottieLight src={`/animations/${kind}/${name}.json`} className={className} autoplay loop />
  );
}