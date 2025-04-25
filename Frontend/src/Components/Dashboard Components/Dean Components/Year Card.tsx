import React from "react";

interface YearCardProps {
  year: string;
  ratio: string;
  setActiveView?: (view: string) => void;
}

const YearCard: React.FC<YearCardProps> = ({ year, ratio, setActiveView }) => {
  return (
    <div
      onClick={() => setActiveView?.("studentEval")}
      className="flex items-center justify-center h-54 w-54 md:h-[14vw] md:w-[14vw] backdrop-blur-lg backdrop-hue-rotate-700 rounded-xl shadow-2xl hover:scale-105 cursor-pointer"
    >
      <div
        className="radial-progress h-35 w-35 md:h-[14vw] md:w-[14vw] text-white"
        style={{ "--value": 70 } as React.CSSProperties}
        aria-valuenow={70}
        role="progressbar"
      >
        <span className="text-white font-bold text-center text-xl sm:text-2xl">
          {year} Year
          <br />
          {ratio}
        </span>
      </div>
    </div>
  );
};

export default YearCard;
