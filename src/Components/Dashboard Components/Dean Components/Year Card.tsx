import React from "react";

interface YearCardProps {
  year: string;
  ratio: string; // e.g. "16/32"
  setActiveView?: (
    view: string
  ) => void;
}

const YearCard: React.FC<
  YearCardProps
> = ({
  year,
  ratio,
  setActiveView,
}) => {
  const [num, denom] = ratio
    .split("/")
    .map(Number);
  const percentage =
    denom &&
    !isNaN(num) &&
    !isNaN(denom)
      ? Math.round((num / denom) * 100)
      : 0;

  return (
    <div
      onClick={() =>
        setActiveView?.("studentEval")
      }
      className="flex items-center justify-center backdrop-blur-lg backdrop-hue-rotate-700 rounded-full shadow-2xl hover:scale-105 cursor-pointer"
    >
      <div
        className="radial-progress h-64 w-64 md:h-[14vw] md:w-[14vw] text-white shadow-2xl"
        style={
          {
            "--value": percentage,
          } as React.CSSProperties
        }
        aria-valuenow={percentage}
        role="progressbar"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-bold text-xl sm:text-2xl">
            {year} Year
          </span>
          <span className="font-bold text-xl sm:text-2xl">
            {percentage}%
          </span>
          <span className="text-sm text-gray-300">
            {ratio}
          </span>
        </div>
      </div>
    </div>
  );
};

export default YearCard;
