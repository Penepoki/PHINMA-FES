import React from "react";

interface SemesterCardProps {
  semester: string;
  ratio: string; // e.g. "16/32"
  setActiveView?: (view: string) => void;
}

const SemesterCard: React.FC<SemesterCardProps> = ({ semester, ratio, setActiveView }) => {
  const [num, denom] = ratio.split("/").map(Number);
  const percentage = denom && !isNaN(num) && !isNaN(denom) ? Math.round((num / denom) * 100) : 0;

  return (
    <div
      onClick={() => setActiveView?.("studentEval")}
      className="flex items-center justify-center rounded-full shadow-2xl backdrop-blur-lg backdrop-hue-rotate-700"
    >
      <div
        className="radial-progress h-40 w-40 text-white shadow-2xl md:h-80 md:w-80"
        style={
          {
            "--value": percentage,
          } as React.CSSProperties
        }
        aria-valuenow={percentage}
        role="progressbar"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold sm:text-2xl">{semester} Sem</span>
          <span className="text-xl font-bold sm:text-2xl">{percentage}%</span>
          <span className="text-sm text-gray-300">{ratio}</span>
        </div>
      </div>
    </div>
  );
};

export default SemesterCard;
