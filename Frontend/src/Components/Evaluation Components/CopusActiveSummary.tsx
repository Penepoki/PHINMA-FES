import React from "react";
import GaugeChart from "./GaugeChart";

type TalliesPerEval = {
  [evaluationId: number]: {
    activeLearningPercentage?: number;
  };
};

interface Props {
  evaluations: { id: number; name?: string; evaluation_type: string }[];
  evaluationTallies: TalliesPerEval;
  totalActiveLearningPercentage?: number; // from API
  title?: string;
}

const CopusActiveSummary: React.FC<Props> = ({
  evaluations,
  evaluationTallies,
  totalActiveLearningPercentage = 0,
  title = "Active Learning Summary",
}) => {
  // Traffic-light palette
  const pick = (v: number) => (v < 40 ? "#ef4444" : v < 70 ? "#f59e0b" : "#22c55e");

  const LegendBars = () => (
    <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ef4444" }} />
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wide text-white">Low</p>
          <p className="text-[11px] text-white">&lt; 40%</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#f59e0b" }} />
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wide text-white">Watch</p>
          <p className="text-[11px] text-white">40–69%</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#22c55e" }} />
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wide text-white">Good</p>
          <p className="text-[11px] text-white">≥ 70%</p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      className={[
        "mt-4 w-full rounded-2xl border border-white/10",
        "bg-gradient-to-br from-[#1c402a]/60 to-[#1b2e3e]/60",
        "shadow-lg ring-1 ring-black/30 backdrop-blur-sm",
        "p-4 sm:p-5 lg:p-6",
        "text-white",
      ].join(" ")}
      aria-label="COPUS Active Learning Summary"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
          <p className="text-xs sm:text-sm text-white">
            Overall and per-evaluation active learning percentages
          </p>
        </div>
        <LegendBars />
      </div>

      {/* Content */}
      <div
        className={[
          "grid gap-3 sm:gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          "[&>*]:min-w-0",
        ].join(" ")}
      >
        {/* Per-evaluation gauges first */}
        {evaluations.map((ev, idx) => {
          const v = evaluationTallies[ev.id]?.activeLearningPercentage ?? 0;
          return (
            <div
              key={ev.id}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 sm:p-4"
            >
              <GaugeChart
                value={v}
                label={ev.name || `COPUS ${idx + 1}`}
                color={pick(v)}
              />
            </div>
          );
        })}

        {/* Overall gauge last (on the right) */}
        <div className="flex items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 sm:p-4">
          <GaugeChart
            value={totalActiveLearningPercentage}
            label="Active Learning % (Overall)"
            color={pick(totalActiveLearningPercentage)}
          />
        </div>
      </div>
    </section>
  );
};

export default CopusActiveSummary;
