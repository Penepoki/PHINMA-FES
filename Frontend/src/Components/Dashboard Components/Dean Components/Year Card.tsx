import React from "react";

interface YearCardProps {
  year: string;
  ratio: string; // e.g. "16/32"
  setActiveView?: (view: string) => void;
  /** When true, shows a skeleton placeholder instead of the progress UI */
  isLoading?: boolean;
}

const YearCard: React.FC<YearCardProps> = ({
  year,
  ratio,
  setActiveView,
  isLoading = false,
}) => {
  const [num, denom] = ratio.split("/").map(Number);
  const percentage =
    denom && !isNaN(num) && !isNaN(denom)
      ? Math.round((num / denom) * 100)
      : 0;

  // Optional: small random delay to stagger the float animation
  const delay = (Math.random() * 2).toFixed(2);

  // Shared size so the card doesn't reflow when loading finishes
  const sizeClasses = "h-45 w-45 md:h-[14vw] md:w-[14vw]";

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        aria-busy="true"
        aria-live="polite"
      >
        <div
          className={`tooltip float-breathe ${sizeClasses} bg-black/5 rounded-full shadow-2xl backdrop-blur-lg`}
          data-tip="Loading…"
          style={{ animationDelay: `${delay}s` }}
        >
          {/* Circular skeleton placeholder */}
          <div className={`skeleton ${sizeClasses} rounded-full`} />

          {/* Optional spinner in the middle for extra clarity */}
          <div className="pointer-events-none absolute flex h-full w-full items-center justify-center">
            <span className="loading loading-spinner loading-md text-white/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setActiveView?.("studentEval")}
      className="tooltip float-breathe flex cursor-pointer items-center justify-center rounded-full shadow-2xl backdrop-blur-lg backdrop-hue-rotate-700 hover:scale-105"
      data-tip="Click to view student evaluation page"
      style={{ animationDelay: `${delay}s` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setActiveView?.("studentEval");
      }}
    >
      <div
        className={`radial-progress ${sizeClasses} text-white shadow-2xl`}
        style={
          {
            // DaisyUI radial-progress expects this CSS var
            "--value": percentage,
          } as React.CSSProperties
        }
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold sm:text-2xl">{year} Year</span>
          <span className="text-xl font-bold sm:text-2xl">{percentage}%</span>
          <span className="text-sm text-gray-300">{ratio}</span>
        </div>
      </div>
    </div>
  );
};

export default YearCard;
