import { motion } from "framer-motion";
import React from "react";

type Evaluations = {
  name: string;
  fullname: string;
  image?: string | null;
  bgColor?: string;
  textColor?: string;
  isAddCard?: boolean;
  onClick?: () => void;
};

/* -------------------------------------------
   Skeletons (daisyUI) — mirrored from SchoolCards
--------------------------------------------*/
const SkeletonCircle = ({className = ""}: { className?: string }) => (
    <div className={`skeleton rounded-full ${className}`}/>
);

const SkeletonLine = ({
                          width = "w-3/4",
                          height = "h-4",
                          className = "",
                      }: {
    width?: string;
    height?: string;
    className?: string;
}) => <div className={`skeleton ${width} ${height} ${className}`}/>;

const SkeletonEvalCard: React.FC = () => {
    return (
        <div className="shadow-2xl">
            {/* top (image circle area) */}
            <div
                className="flex h-40 w-full flex-col items-center justify-center rounded-tl-xl rounded-tr-xl bg-black/20 shadow-2xl">
                <SkeletonCircle className="size-30"/>
            </div>
            {/* bottom (texts) */}
            <div
                className="flex h-30 w-full flex-col rounded-br-lg rounded-bl-xl px-5 py-2 shadow-2xl backdrop-hue-rotate-300">
                <div className="mt-4 flex flex-col gap-2 text-start">
                    <SkeletonLine width="w-2/3" height="h-5"/>
                    <SkeletonLine width="w-5/6" height="h-4" className="opacity-70"/>
                </div>
            </div>
        </div>
    );
};

/* --------------------
   Actual Evaluation Card
---------------------*/
const EvalCard: React.FC<Evaluations> = ({
  name,
  fullname,
  image,
  bgColor = "backdrop-hue-700",
  textColor = "text-white",
  isAddCard = false,
  onClick,
}) => {
  if (isAddCard) {
    return (
      <div
        className="backdrop-blue-lg flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl p-5 text-white shadow-2xl backdrop-hue-rotate-300 hover:scale-105"
        onClick={onClick ?? (() => console.log("Add new subject clicked"))}
      >
        <div className="flex flex-col items-center">
          <div className="flex size-30 items-center justify-center rounded-full text-9xl text-white">
            +
          </div>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold">{name}</span>
          </div>
        </div>
      </div>
    );
  }

  // Regular card
  return (
    <motion.div
        animate={{y: [3, -1, 3], x: [-5, 3, -5], scale: [1, 1.01, 1]}}
        transition={{duration: 7, repeat: Infinity, ease: [0.42, 0, 0.58, 1]}}
      className="shadow-2xl hover:scale-105"
      onClick={onClick}
    >
      <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-tl-xl rounded-tr-xl bg-black/20 shadow-2xl">
          <div className={`${bgColor} text-neutral-content flex size-30 items-center justify-center rounded-full`}>
          {image ? (
              <img src={image} alt={name} className="h-full w-full rounded-full object-cover"/>
          ) : (
              <span className="text-[80px]">{name?.charAt(0) || "?"}</span>
          )}
        </div>
      </div>
      <div className="flex h-30 w-full flex-col rounded-br-lg rounded-bl-xl px-5 py-2 shadow-2xl backdrop-hue-rotate-300">
        <div className="mt-4 flex flex-col text-start">
            <span className={`text-2xl font-bold ${textColor}`}>{name}</span>
            <span className="mt-2 text-sm text-gray-400">{fullname}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* -----------------------
   Grid + Skeleton Toggle
------------------------*/
const EvalCards: React.FC<{
  evaluations: Evaluations[];
  onEvalClick?: (evalName: string) => void;
    isLoading?: boolean;
    skeletonCount?: number; // how many placeholders to show while loading
}> = ({evaluations, onEvalClick, isLoading = false, skeletonCount = 5}) => {
    if (isLoading) {
        const placeholders = Array.from({length: skeletonCount});
        return (
            <div className="mt-6 flex h-full w-screen flex-col flex-wrap justify-center gap-6 md:flex-row">
                {placeholders.map((_, idx) => (
                    <div key={`sk-${idx}`} className="h-1/2 w-full md:w-1/5">
                        <SkeletonEvalCard/>
                    </div>
                ))}
            </div>
        );
    }

  return (
    <div className="mt-6 flex h-full w-screen flex-col flex-wrap justify-center gap-6 md:flex-row">
      {evaluations.map((evaluation, idx) => (
        <div key={idx} className="h-1/2 w-full md:w-1/5">
          <EvalCard
            {...evaluation}
            onClick={() => !evaluation.isAddCard && onEvalClick?.(evaluation.name)}
          />
        </div>
      ))}
    </div>
  );
};

export default EvalCards;
