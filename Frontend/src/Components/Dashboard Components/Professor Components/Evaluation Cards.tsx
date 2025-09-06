import { motion } from "framer-motion";

type Evaluations = {
  name: string;
  fullname: string;
  image?: string | null;
  bgColor?: string;
  textColor?: string;
  isAddCard?: boolean;
  onClick?: () => void;
};

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
      animate={{
        y: [3, -1, 3],
        x: [-5, 3, -5],
        scale: [1, 1.01, 1],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1],
      }}
      className="shadow-2xl hover:scale-105"
      onClick={onClick}
    >
      <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-tl-xl rounded-tr-xl bg-black/20 shadow-2xl">
        <div
          className={`${bgColor} text-neutral-content flex size-30 items-center justify-center rounded-full`}
        >
          {image ? (
            <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
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

const EvalCards: React.FC<{
  evaluations: Evaluations[];
  onEvalClick?: (evalName: string) => void;
}> = ({ evaluations, onEvalClick }) => {
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
