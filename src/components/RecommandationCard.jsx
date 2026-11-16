import WeatherLottie from "./WeatherLottie";

const REC_STYLES = {
  hot: { color: "#f97316", cardBg: "bg-orange-50/90" },
  warm: { color: "#fb923c", cardBg: "bg-amber-50/90" },
  cold: { color: "#38bdf8", cardBg: "bg-sky-50/90" },
  sunny: { color: "#f59e0b", cardBg: "bg-yellow-50/90" },
  rain: { color: "#3b82f6", cardBg: "bg-blue-50/90" },
  snow: { color: "#818cf8", cardBg: "bg-indigo-50/90" },
  fog: { color: "#94a3b8", cardBg: "bg-slate-100/90" },
  cloudy: { color: "#64748b", cardBg: "bg-slate-100/90" },
  pleasant: { color: "#22c55e", cardBg: "bg-emerald-50/90" },
};

export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  const style = REC_STYLES[recommendation.type] || REC_STYLES.pleasant;

  return (
    <section
      className={`flex items-start gap-4 w-full bg-white rounded-2xl border border-gray-100 border-l-[6px] shadow-xl p-6 max-[480px]:p-5 transition-transform duration-200 hover:-translate-y-0.5 ${style.cardBg}`}
      style={{ borderLeftColor: style.color }}
    >
      <span className="inline-flex items-center justify-center w-[58px] h-[58px] rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 flex-shrink-0">
        {recommendation?.type && (
          <WeatherLottie kind="advice" name={recommendation.type} className="w-[42px] h-[42px]" />
        )}
      </span>
      <div>
        <div className="flex items-center gap-3 mb-2 max-[480px]:flex-wrap">
          <span
            className="text-[11px] font-bold uppercase tracking-wider text-white rounded-full px-3 py-0.5"
            style={{ background: style.color }}
          >
            {recommendation?.label}
          </span>
          <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500 m-0">
            Your smart suggestion
          </h3>
        </div>
        <p className="text-[16px] font-semibold leading-relaxed text-gray-900 m-0">
          {recommendation?.text}
        </p>
      </div>
    </section>
  );
}