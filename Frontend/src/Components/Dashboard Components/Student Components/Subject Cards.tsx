import React from "react";
import { motion } from "framer-motion";

/* =========================
   Types
========================= */
export type SubjectCardItem = {
  name: string;
  image?: string | null;
  bgColor?: string;   // e.g. "backdrop-hue-700" or "bg-[#1c402a]/30"
  textColor?: string; // e.g. "text-white"
  subtitle?: string | null;
  isAddCard?: boolean;
  isCompleted?: boolean; // optional, only shows a small ring
  onClick?: () => void;
};

type SubjectCardProps = SubjectCardItem & {
  /** If true, show a small green ring around the avatar when isCompleted */
  completeRing?: boolean;
};

/* =========================
   Skeletons (match widths)
========================= */
const SkeletonCircle = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton rounded-full ${className}`} />
);

export const SkeletonSubjectCard: React.FC = () => {
  return (
    <div className="shadow-2xl">
      <div className="flex h-40 w-full flex-col items-center justify-center rounded-tl-xl rounded-tr-xl bg-black/20 shadow-2xl">
        <SkeletonCircle className="size-30" />
      </div>
      <div className="flex h-30 w-full flex-col rounded-br-lg rounded-bl-xl px-5 py-2 shadow-2xl backdrop-hue-rotate-300">
        <div className="mt-4 flex flex-col gap-2 text-start">
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-4 w-5/6 opacity-70" />
        </div>
      </div>
    </div>
  );
};

/* =========================
   SubjectCard — School look
========================= */
export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  image,
  bgColor = "backdrop-hue-700",
  textColor = "text-white",
  subtitle,
  isAddCard = false,
  isCompleted = false,
  completeRing = true,
  onClick,
}) => {
  if (isAddCard) {
    return (
      <div
        className="backdrop-blue-lg flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl p-5 text-white shadow-2xl backdrop-hue-rotate-300 transition-transform hover:scale-105"
        onClick={onClick}
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

  return (
    <motion.div
      animate={{ y: [3, -1, 3], x: [-5, 3, -5], scale: [1, 1.01, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
      className="shadow-2xl transition-transform hover:scale-105"
      onClick={onClick}
    >
      {/* TOP */}
      <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-tl-xl rounded-tr-xl bg-black/20 shadow-2xl">
        <div
          className={`${bgColor} text-neutral-content flex size-30 items-center justify-center rounded-full overflow-hidden ${isCompleted && completeRing ? "" : ""
            }`}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full rounded-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="text-[80px] leading-none">{name?.charAt(0) || "?"}</span>
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="flex h-30 w-full flex-col rounded-br-lg rounded-bl-xl px-5 py-2 shadow-2xl backdrop-hue-rotate-300">
        <div className="mt-4 flex flex-col text-start">
          <span className={`text-2xl font-bold ${textColor}`}>{name}</span>
          {subtitle ? <span className="mt-2 text-sm text-gray-400">{subtitle}</span> : null}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================
   Grid wrapper — ORIGINAL
   (mobile 1-col, sm:2, lg:4)
========================= */
const SubjectCards: React.FC<{
  subjects: SubjectCardItem[];
  onClick?: (subjectName: string) => void;
  isLoading?: boolean;
  skeletonCount?: number;
  addCard?: { label: string; onClick: () => void } | null;
  completeRing?: boolean;
}> = ({
  subjects,
  onClick,
  isLoading = false,
  skeletonCount = 5,
  addCard = null,
  completeRing = true,
}) => {
    const cards: SubjectCardItem[] = addCard
      ? [{ name: addCard.label, isAddCard: true, onClick: addCard.onClick }, ...subjects]
      : subjects;

    return (
      <div className="w-full rounded-2xl bg-black/5">
        <div className="flex flex-col items-center">
          {/* Optional header — keep exactly as original */}

          <div className="flex flex-wrap justify-center gap-6 px-6 py-6 md:mt-6 md:px-0">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, idx) => (
                <div key={`sk-${idx}`} className="w-full sm:w-1/2 lg:w-1/4">
                  <SkeletonSubjectCard />
                </div>
              ))
              : cards.map((subject, idx) => (
                <div key={`${subject.name}-${idx}`} className="w-full sm:w-1/2 lg:w-1/4">
                  <SubjectCard
                    {...subject}
                    completeRing={completeRing}
                    onClick={() =>
                      subject.isAddCard ? subject.onClick?.() : onClick?.(subject.name)
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

export default SubjectCards;
