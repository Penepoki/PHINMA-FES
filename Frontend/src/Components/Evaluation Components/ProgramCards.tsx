// ProgramCards.tsx
import React from "react";

interface Program {
  id: number;
  name: string;
}

const ProgramCard: React.FC<{ program: Program; onClick?: (program: Program) => void }> = ({ program, onClick }) => (
  <div
    className="w-full cursor-pointer rounded-xl bg-[#1c402a] p-6 text-white shadow-xl hover:bg-[#2e5c3a] transition"
    onClick={() => onClick?.(program)}
  >
    <h3 className="text-xl font-bold text-center">{program.name}</h3>
  </div>
);

const ProgramCards: React.FC<{
  programs: Program[];
  onClick?: (program: Program) => void;
}> = ({ programs, onClick }) => (
  <div className="w-full rounded-xl bg-black/20">
    <div className="flex flex-col items-center">
      <p className="mt-6 text-xl text-gray-300">Program List:</p>
      <div className="flex flex-wrap justify-center gap-6 px-6 py-6 md:mt-6 md:px-0">
        {programs.map((program) => (
          <div key={program.id} className="w-full sm:w-1/2 lg:w-1/4">
            <ProgramCard program={program} onClick={onClick} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProgramCards;
